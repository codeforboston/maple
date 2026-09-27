"""One-off migration for the filing_id period-collision fix.

filing_id() used to omit the reporting period, so a bill position re-reported
across multiple periods within the same general court collided onto one
Firestore doc, silently overwriting earlier periods (see writer.write_filings
and portal.filing_id). Every existing lobbyingFilings doc was written under
that old scheme; this script regenerates them under the new, period-aware
scheme and removes the orphaned old-scheme docs.

Unlike reparse_archive.py's own resumability bookkeeping (the
"reparse-processed" GCS marker, meant for routine re-parses when parser logic
changes), this migration always processes every archived CompleteDisclosure
page regardless of that marker — the point is a full, one-time regeneration
under the new id scheme, not an incremental catch-up.

Usage (three phases, run in order):

    GOOGLE_APPLICATION_CREDENTIALS=~/.config/gcloud/application_default_credentials.json \\
      GOOGLE_CLOUD_PROJECT=<project> python3 migrate_filing_ids.py --phase write \\
      --ids-file /tmp/<project>_correct_filing_ids.txt

    # dry run first: reports how many stale (pre-fix) docs would be deleted
    GOOGLE_APPLICATION_CREDENTIALS=... GOOGLE_CLOUD_PROJECT=<project> \\
      python3 migrate_filing_ids.py --phase cleanup --ids-file /tmp/<project>_correct_filing_ids.txt

    # then actually delete them
    GOOGLE_APPLICATION_CREDENTIALS=... GOOGLE_CLOUD_PROJECT=<project> \\
      python3 migrate_filing_ids.py --phase cleanup --ids-file /tmp/<project>_correct_filing_ids.txt --execute

    GOOGLE_APPLICATION_CREDENTIALS=... GOOGLE_CLOUD_PROJECT=<project> \\
      python3 migrate_filing_ids.py --phase stats

Safe to delete once dev and prod have both been migrated.
"""
from __future__ import annotations

import argparse
import os
from concurrent.futures import ThreadPoolExecutor, as_completed

from bs4 import BeautifulSoup
from google.cloud import firestore, storage
from google.cloud.storage import Blob

import archive
from portal import filing_id, parse_disclosure_detail, year_to_general_court
from reparse_archive import _meta_for_disc_url
from writer import FILINGS_COLLECTION, compute_stats, write_filings, write_registrant

_DEFAULT_WORKERS = 20


def _process_blob_write(db: firestore.Client, blob: Blob) -> tuple[str, list[str]]:
    """Reparse one archived page and rewrite it under the new filing_id
    scheme. Returns (status, filing_ids computed for this page)."""
    url = (blob.metadata or {}).get("source-url", "")
    if "CompleteDisclosure" not in url:
        return "skipped", []

    meta = _meta_for_disc_url(db, url)
    if meta is None or meta.year is None:
        return "skipped", []

    try:
        html = blob.download_as_text(encoding="utf-8")
        soup = BeautifulSoup(html, "html.parser")
        detail = parse_disclosure_detail(soup, meta.year)
    except Exception as exc:
        print(f"  ERROR parsing {url}: {exc}")
        return "error", []

    gc = year_to_general_court(meta.year)
    fids = [
        filing_id(
            meta.entity_name, bill.client_name, bill.chamber, bill.bill_id,
            gc, bill.position, detail.period_start,
        )
        for bill in detail.bills
    ]

    write_registrant(db, meta, detail, url)
    write_filings(db, meta, detail)

    return "processed", fids


def run_write(limit: int | None, workers: int, out_path: str) -> None:
    gcs = storage.Client()
    bucket = gcs.bucket(archive._get_bucket_name())
    db = firestore.Client()

    blobs = list(bucket.list_blobs(prefix="raw_html/"))
    print(f"Found {len(blobs)} archived pages")
    if limit is not None:
        blobs = blobs[:limit]

    processed = skipped = errors = done = 0
    all_fids: set[str] = set()

    with ThreadPoolExecutor(max_workers=workers) as pool, open(out_path, "w") as out:
        futures = {pool.submit(_process_blob_write, db, blob): blob for blob in blobs}
        for future in as_completed(futures):
            status, fids = future.result()
            if status == "processed":
                processed += 1
                for fid in fids:
                    if fid not in all_fids:
                        all_fids.add(fid)
                        out.write(fid + "\n")
            elif status == "skipped":
                skipped += 1
            else:
                errors += 1
            done += 1
            if done % 500 == 0 or done == len(blobs):
                print(
                    f"  [{done}/{len(blobs)}] {processed} processed, {skipped} skipped,"
                    f" {errors} errors, {len(all_fids)} distinct fids so far"
                )

    print(
        f"\nDone: {processed} reparsed, {skipped} skipped, {errors} errors,"
        f" {len(all_fids)} distinct correct filing_ids recorded to {out_path}"
    )


def run_cleanup(ids_path: str, execute: bool) -> None:
    with open(ids_path) as f:
        correct_ids = {line.strip() for line in f if line.strip()}
    print(f"Loaded {len(correct_ids)} correct filing_ids from {ids_path}")

    db = firestore.Client()
    stale_refs = []
    total = 0
    for doc in db.collection(FILINGS_COLLECTION).select([]).stream():
        total += 1
        if doc.id not in correct_ids:
            stale_refs.append(doc.reference)
        if total % 50000 == 0:
            print(f"  scanned {total}, stale so far {len(stale_refs)}")

    print(f"\nScanned {total} total filing docs. Stale (pre-fix) docs to delete: {len(stale_refs)}")
    if not execute:
        print("Dry run — nothing deleted. Re-run with --execute to delete.")
        return

    batch = db.batch()
    count = 0
    for ref in stale_refs:
        batch.delete(ref)
        count += 1
        if count % 400 == 0:
            batch.commit()
            batch = db.batch()
            if count % 20000 == 0:
                print(f"  deleted {count}/{len(stale_refs)}")
    if count % 400 != 0:
        batch.commit()
    print(f"Deleted {count} stale filing docs.")


def main() -> None:
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--phase", required=True, choices=["write", "cleanup", "stats"])
    p.add_argument("--limit", type=int, default=None, help="write phase: stop after N archived pages")
    p.add_argument("--workers", type=int, default=_DEFAULT_WORKERS)
    p.add_argument("--ids-file", default="/tmp/correct_filing_ids.txt")
    p.add_argument("--execute", action="store_true", help="cleanup phase: actually delete stale docs")
    args = p.parse_args()

    if not os.environ.get("ARCHIVE_RAW"):
        os.environ["ARCHIVE_RAW"] = "1"

    if args.phase == "write":
        run_write(args.limit, args.workers, args.ids_file)
    elif args.phase == "cleanup":
        run_cleanup(args.ids_file, args.execute)
    elif args.phase == "stats":
        compute_stats(firestore.Client())


if __name__ == "__main__":
    main()
