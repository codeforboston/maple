"""Offline reparse driver: re-ingests raw HTML from the GCS archive.

Downloads archived CompleteDisclosure pages from GCS, re-runs the pure parsers
against them, and writes results back to Firestore. Use this when parser logic
has changed and historical data needs to be re-ingested without re-scraping.

For each archived disclosure page the driver looks up the corresponding
registrant document in Firestore (via the disclosureUrls array) to obtain the
entity name needed to construct filing document IDs. Registrant documents must
therefore already exist before running a reparse.

Usage:
    GOOGLE_APPLICATION_CREDENTIALS=~/.config/gcloud/application_default_credentials.json \\
      python3 reparse_archive.py [--limit N] [--dry-run]

Progress is tracked in Firestore at /scrapers/lobbyingReparse so the run is
resumable: restarting skips blobs already marked as processed.
"""

from __future__ import annotations

import argparse
import os

from bs4 import BeautifulSoup
from google.cloud import firestore, storage

import archive
from portal import DisclosureMeta, parse_disclosure_detail, year_from_disc_url
from writer import REGISTRANTS_COLLECTION, write_filings

REPARSE_DOC = "/scrapers/lobbyingReparse"


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


def _is_processed(db: firestore.Client, blob_name: str) -> bool:
    doc = db.document(REPARSE_DOC).get()
    if not doc.exists:
        return False
    return blob_name in doc.to_dict().get("processedBlobs", [])


def _mark_processed(db: firestore.Client, blob_name: str) -> None:
    db.document(REPARSE_DOC).set(
        {"processedBlobs": firestore.ArrayUnion([blob_name])},
        merge=True,
    )


def run(limit: int | None, dry_run: bool) -> None:
    gcs = storage.Client()
    bucket_name = archive._get_bucket_name()
    bucket = gcs.bucket(bucket_name)

    db: firestore.Client | None = None if dry_run else firestore.Client()

    blobs = list(bucket.list_blobs(prefix="raw_html/"))
    print(f"Found {len(blobs)} archived pages")

    processed = 0
    skipped = 0
    errors = 0

    for blob in blobs:
        if limit is not None and processed >= limit:
            break

        blob.reload()
        url = (blob.metadata or {}).get("source-url", "")

        if "CompleteDisclosure" not in url:
            skipped += 1
            continue

        if db is not None and _is_processed(db, blob.name):
            skipped += 1
            continue

        year = year_from_disc_url(url)
        if year is None:
            print(f"  SKIP {blob.name}: cannot extract year from {url!r}")
            skipped += 1
            continue

        meta: DisclosureMeta | None = None
        if db is not None:
            meta = _meta_for_disc_url(db, url)
            if meta is None:
                print(f"  SKIP {blob.name}: no registrant found for {url!r}")
                skipped += 1
                continue

        try:
            html = blob.download_as_text(encoding="utf-8")
            soup = BeautifulSoup(html, "html.parser")
            detail = parse_disclosure_detail(soup, year)
        except Exception as exc:
            print(f"  ERROR parsing {url}: {exc}")
            errors += 1
            continue

        print(
            f"  {url[:80]!r} — {len(detail.compensation)} comp,"
            f" {len(detail.bills)} bills"
        )

        if not dry_run and db is not None and meta is not None:
            write_filings(db, meta, detail)
            _mark_processed(db, blob.name)

        processed += 1

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
    args = parser.parse_args()

    # Ensure archive module can resolve the bucket name even in dry-run mode
    if not os.environ.get("ARCHIVE_RAW"):
        os.environ["ARCHIVE_RAW"] = "1"

    run(limit=args.limit, dry_run=args.dry_run)


if __name__ == "__main__":
    main()
