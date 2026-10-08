"""Offline reparse driver: re-ingests raw HTML from the GCS archive.

Downloads archived CompleteDisclosure pages from GCS, re-runs the pure parsers
against them, and writes both the registrant (compensation/client roster) and
filing (bill-level activity) documents back to Firestore. Use this when parser
logic has changed, or when registrant documents need reprocessing under a
corrected write path, without re-scraping the live portal.

For each archived disclosure page the driver looks up the corresponding
registrant document in Firestore (via the disclosureUrls array) to obtain the
entity name needed to construct filing document IDs. Registrant documents must
therefore already exist before running a reparse.

Usage:
    GOOGLE_APPLICATION_CREDENTIALS=~/.config/gcloud/application_default_credentials.json \\
      python3 reparse_archive.py [--limit N] [--dry-run] [--workers N]

Pages are processed concurrently (default 20 worker threads — each page is a
handful of independent network round-trips, so this is I/O-bound and scales
well with concurrency). Progress is tracked via GCS object metadata
(reparse-processed=true) so the run is resumable: restarting (even after a
crash or manual interruption) skips blobs already marked as processed and
never double-processes one that's mid-flight, since the mark is only written
after a successful write.
"""

from __future__ import annotations

import argparse
import os
from concurrent.futures import ThreadPoolExecutor, as_completed

from bs4 import BeautifulSoup
from google.cloud import firestore, storage
from google.cloud.storage import Blob

import archive
from portal import DisclosureMeta, parse_disclosure_detail
from writer import REGISTRANTS_COLLECTION, write_filings, write_registrant

_PROCESSED_META_KEY = "reparse-processed"
_DEFAULT_WORKERS = 20


def _meta_for_disc_url(db: firestore.Client, disc_url: str) -> DisclosureMeta | None:
    """Look up the registrant that owns this disclosure URL."""
    results = (
        db.collection(REGISTRANTS_COLLECTION)
        .where("disclosureUrls", "array_contains", disc_url)
        .limit(1)
        .get()
    )
    if not results:
        return None
    data = results[0].to_dict()
    return DisclosureMeta(
        entity_name=data.get("entityName", ""),
        year=data.get("year"),
        reg_type=data.get("regType", "Lobbyist"),
        disclosure_urls=data.get("disclosureUrls", []),
    )


def _is_processed(blob: Blob) -> bool:
    return (blob.metadata or {}).get(_PROCESSED_META_KEY) == "true"


def _mark_processed(blob: Blob) -> None:
    blob.metadata = {**(blob.metadata or {}), _PROCESSED_META_KEY: "true"}
    blob.patch()


def _process_blob(db: firestore.Client, blob: Blob, dry_run: bool) -> str:
    """Process one archived page. Returns 'processed', 'skipped', or 'error'.

    Runs inside a worker thread — the Firestore and GCS clients used here are
    safe for concurrent use across threads (each call is an independent HTTP
    request), so no locking is needed.
    """
    url = (blob.metadata or {}).get("source-url", "")

    if "CompleteDisclosure" not in url:
        return "skipped"

    if _is_processed(blob):
        return "skipped"

    meta = _meta_for_disc_url(db, url)
    if meta is None:
        print(f"  SKIP {blob.name}: no registrant found for {url!r}")
        return "skipped"

    if meta.year is None:
        print(f"  SKIP {blob.name}: registrant doc has no year")
        return "skipped"

    try:
        html = blob.download_as_text(encoding="utf-8")
        soup = BeautifulSoup(html, "html.parser")
        detail = parse_disclosure_detail(soup, meta.year)
    except Exception as exc:
        print(f"  ERROR parsing {url}: {exc}")
        return "error"

    if not dry_run:
        write_registrant(db, meta, detail, url)
        write_filings(db, meta, detail)
        _mark_processed(blob)

    return "processed"


def run(limit: int | None, dry_run: bool, workers: int = _DEFAULT_WORKERS) -> None:
    gcs = storage.Client()
    bucket_name = archive._get_bucket_name()
    bucket = gcs.bucket(bucket_name)

    db = firestore.Client()

    # list_blobs() already returns full metadata for each object (GCS listings
    # include it, unlike e.g. S3), so no per-blob .reload() round-trip is
    # needed — that alone roughly halves the number of GCS calls per page.
    blobs = list(bucket.list_blobs(prefix="raw_html/"))
    print(f"Found {len(blobs)} archived pages")

    if limit is not None:
        blobs = blobs[:limit]

    processed = 0
    skipped = 0
    errors = 0
    done = 0

    with ThreadPoolExecutor(max_workers=workers) as pool:
        futures = {pool.submit(_process_blob, db, blob, dry_run): blob for blob in blobs}
        for future in as_completed(futures):
            result = future.result()
            if result == "processed":
                processed += 1
            elif result == "skipped":
                skipped += 1
            else:
                errors += 1
            done += 1
            if done % 200 == 0 or done == len(blobs):
                print(
                    f"  [{done}/{len(blobs)}] {processed} processed,"
                    f" {skipped} skipped, {errors} errors"
                )

    print(
        f"\nDone: {processed} reparsed, {skipped} skipped, {errors} errors"
        + (" (dry run — nothing written)" if dry_run else "")
    )


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Reparse raw HTML archive into Firestore"
    )
    parser.add_argument("--limit", type=int, default=None, help="Stop after N pages")
    parser.add_argument(
        "--dry-run", action="store_true", help="Parse but do not write to Firestore"
    )
    parser.add_argument(
        "--workers",
        type=int,
        default=_DEFAULT_WORKERS,
        help=f"Concurrent worker threads (default {_DEFAULT_WORKERS})",
    )
    args = parser.parse_args()

    # Ensure archive module can resolve the bucket name even in dry-run mode
    if not os.environ.get("ARCHIVE_RAW"):
        os.environ["ARCHIVE_RAW"] = "1"

    run(limit=args.limit, dry_run=args.dry_run, workers=args.workers)


if __name__ == "__main__":
    main()
