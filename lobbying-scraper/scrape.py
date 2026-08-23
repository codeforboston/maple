"""Lobbying disclosure scraper — Cloud Run entry point.

Runs on a weekly Cloud Scheduler trigger. Checks for new or amended disclosures
and exits immediately if none are found (fast path). When new disclosures exist,
fetches and writes them to Firestore.

Also serves as the library used by the TypeScript backfill admin script via
subprocess.

Environment variables:
  GOOGLE_CLOUD_PROJECT  — GCP project ID (set automatically in Cloud Run)
  FIRESTORE_EMULATOR_HOST — set to use the local emulator (e.g. localhost:8080)

CLI flags (for local / backfill use):
  --year YEAR     Only process this year (default: current + prior)
  --limit N       Max registrants per year (for testing)
  --dry-run       Fetch and parse but do not write to Firestore
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import sys
from datetime import datetime, timezone

from google.cloud import firestore

from portal import (
    FIRST_YEAR,
    fetch_disclosure_detail,
    fetch_disclosure_meta,
    fetch_summary_links,
    make_session,
)
from writer import (
    BACKFILL_DOC,
    BACKFILL_URLS_COLLECTION,
    PROCESSED_URLS_COLLECTION,
    SCRAPER_DOC,
    SUMMARY_CACHE_COLLECTION,
    write_filings,
    write_registrant,
)


# ── Cursor helpers ────────────────────────────────────────────────────────────
#
# Weekly-mode cursor state lives in subcollections under SCRAPER_DOC, one small
# doc per URL, mirroring the backfill cursor below. An earlier version stored
# the entire processed-URL history and summary cache as two fields on a single
# document; that doc grew past Firestore's 1MB limit once run against the full
# corpus, silently failing (and thus skipping) every registrant processed
# after the limit was hit. Per-URL docs have no such ceiling.


def _url_hash(url: str) -> str:
    return hashlib.sha256(url.encode()).hexdigest()[:40]


def _is_processed(db: firestore.Client, disc_url: str) -> bool:
    h = _url_hash(disc_url)
    return (
        db.document(SCRAPER_DOC)
        .collection(PROCESSED_URLS_COLLECTION)
        .document(h)
        .get()
        .exists
    )


def _mark_processed(db: firestore.Client, disc_url: str) -> None:
    h = _url_hash(disc_url)
    db.document(SCRAPER_DOC).collection(PROCESSED_URLS_COLLECTION).document(h).set(
        {"url": disc_url, "processedAt": datetime.now(tz=timezone.utc).isoformat()}
    )


def _get_cached_disc_urls(db: firestore.Client, summary_url: str) -> list[str] | None:
    """Cached disclosure URLs for a registrant's summary page, or None if unseen.

    Only consulted for prior years — the current year is always refetched live
    since its disclosures can still change.
    """
    h = _url_hash(summary_url)
    doc = db.document(SCRAPER_DOC).collection(SUMMARY_CACHE_COLLECTION).document(h).get()
    if not doc.exists:
        return None
    return doc.to_dict().get("discUrls", [])


def _cache_disc_urls(
    db: firestore.Client, summary_url: str, disc_urls: list[str]
) -> None:
    h = _url_hash(summary_url)
    db.document(SCRAPER_DOC).collection(SUMMARY_CACHE_COLLECTION).document(h).set(
        {
            "summaryUrl": summary_url,
            "discUrls": disc_urls,
            "cachedAt": datetime.now(tz=timezone.utc).isoformat(),
        }
    )


def _is_backfill_processed(db: firestore.Client, disc_url: str) -> bool:
    h = _url_hash(disc_url)
    return db.document(BACKFILL_DOC).collection(BACKFILL_URLS_COLLECTION).document(h).get().exists


def _mark_backfill_processed(db: firestore.Client, disc_url: str) -> None:
    h = _url_hash(disc_url)
    db.document(BACKFILL_DOC).collection(BACKFILL_URLS_COLLECTION).document(h).set(
        {"url": disc_url, "processedAt": datetime.now(tz=timezone.utc).isoformat()}
    )


# ── Core processing ───────────────────────────────────────────────────────────


def process_disclosure(
    db: firestore.Client | None,
    session,
    summary_url: str,
    disc_url: str,
    year: int,
    dry_run: bool = False,
) -> tuple[int, int]:
    """Fetch one disclosure page and write registrant + filing documents.

    Returns (compensation_rows, filing_rows).
    """
    meta = fetch_disclosure_meta(session, summary_url)
    detail = fetch_disclosure_detail(session, disc_url, year)

    if dry_run or db is None:
        return len(detail.compensation), len(detail.bills)

    write_registrant(db, meta, detail, disc_url)
    n_filings = write_filings(db, meta, detail)
    return len(detail.compensation), n_filings


# ── Weekly incremental run ────────────────────────────────────────────────────


def run_weekly(
    db: "firestore.Client | None",
    years: list[int],
    limit: int | None = None,
    dry_run: bool = False,
) -> int:
    """Incremental weekly check. Returns number of new disclosures processed."""
    current_year = datetime.now(tz=timezone.utc).year
    use_cursor = db is not None and not dry_run

    session = make_session()
    new_count = 0

    for year in years:
        print(f"\n── {year} ──")
        try:
            summary_urls = fetch_summary_links(session, year)
        except Exception as e:
            print(f"  failed to fetch summary links: {e}", file=sys.stderr)
            continue

        if limit:
            summary_urls = summary_urls[:limit]

        print(f"  {len(summary_urls)} registrants on portal")

        for summary_url in summary_urls:
            # Prior years: trust the cache if we have one. Current year:
            # always refetch live, since its disclosures can still change.
            disc_urls = None
            if year != current_year and use_cursor:
                disc_urls = _get_cached_disc_urls(db, summary_url)

            if disc_urls is None:
                try:
                    meta = fetch_disclosure_meta(session, summary_url)
                    disc_urls = meta.disclosure_urls
                    if use_cursor:
                        _cache_disc_urls(db, summary_url, disc_urls)
                except Exception as e:
                    print(f"  failed to fetch summary {summary_url}: {e}", file=sys.stderr)
                    continue

            for disc_url in disc_urls:
                if use_cursor and _is_processed(db, disc_url):
                    continue
                try:
                    comp_n, filing_n = process_disclosure(
                        db, session, summary_url, disc_url, year, dry_run=dry_run
                    )
                    new_count += 1
                    print(f"  processed: {comp_n} clients, {filing_n} filings")
                    if use_cursor:
                        _mark_processed(db, disc_url)
                except Exception as e:
                    print(f"  failed to process {disc_url}: {e}", file=sys.stderr)

    return new_count


# ── Historical backfill ───────────────────────────────────────────────────────


def run_backfill(
    db: "firestore.Client | None",
    years: list[int],
    limit: int | None = None,
    dry_run: bool = False,
) -> int:
    """Full historical backfill using the subcollection cursor. Resumable."""
    session = make_session()
    total_new = 0

    for year in years:
        print(f"\n── {year} ──")
        try:
            summary_urls = fetch_summary_links(session, year)
        except Exception as e:
            print(f"  failed to fetch summary links: {e}", file=sys.stderr)
            continue

        if limit:
            summary_urls = summary_urls[:limit]

        print(f"  {len(summary_urls)} registrants on portal")
        year_new = 0

        for i, summary_url in enumerate(summary_urls):
            try:
                meta = fetch_disclosure_meta(session, summary_url)
            except Exception as e:
                print(f"  [{i+1}/{len(summary_urls)}] failed to fetch summary: {e}", file=sys.stderr)
                continue

            for disc_url in meta.disclosure_urls:
                if db is not None and not dry_run and _is_backfill_processed(db, disc_url):
                    continue
                try:
                    comp_n, filing_n = process_disclosure(
                        db, session, summary_url, disc_url, year, dry_run=dry_run
                    )
                    if not dry_run:
                        _mark_backfill_processed(db, disc_url)
                    total_new += 1
                    year_new += 1
                except Exception as e:
                    print(f"  failed to process {disc_url}: {e}", file=sys.stderr)

            if (i + 1) % 50 == 0 or i + 1 == len(summary_urls):
                print(f"  [{i+1}/{len(summary_urls)}] {year_new} new disclosures so far")

        print(f"  {year} complete: {year_new} new disclosures")

    return total_new


# ── Entry point ───────────────────────────────────────────────────────────────


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("--year", type=int, default=None)
    p.add_argument("--limit", type=int, default=None)
    p.add_argument("--dry-run", action="store_true")
    p.add_argument(
        "--mode",
        choices=["weekly", "backfill"],
        default="weekly",
        help="weekly: incremental check; backfill: full history with subcollection cursor",
    )
    args = p.parse_args()

    current_year = datetime.now(tz=timezone.utc).year

    if args.year:
        years = [args.year]
    elif args.mode == "weekly":
        years = [current_year, current_year - 1]
    else:
        years = list(range(FIRST_YEAR, current_year + 1))

    project = os.environ.get("GOOGLE_CLOUD_PROJECT")
    db = firestore.Client(project=project) if not args.dry_run else None

    if args.mode == "weekly":
        n = run_weekly(db, years, limit=args.limit, dry_run=args.dry_run)
        if n == 0:
            print("\nNo new disclosures found.")
        else:
            print(f"\nDone: {n} new disclosures written.")
    else:
        n = run_backfill(db, years, limit=args.limit, dry_run=args.dry_run)
        print(f"\nBackfill complete: {n} new disclosures written.")

    # Emit structured result for callers (e.g. TypeScript backfill script)
    print(json.dumps({"newDisclosures": n}), file=sys.stderr)


if __name__ == "__main__":
    main()
