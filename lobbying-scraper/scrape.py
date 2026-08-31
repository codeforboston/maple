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
    SCRAPER_DOC,
    compute_stats,
    write_filings,
    write_registrant,
)


# ── Cursor helpers ────────────────────────────────────────────────────────────


def _load_live_cursor(db: firestore.Client) -> tuple[set[str], dict[str, list[str]]]:
    """Return (processedDiscUrls, summaryDiscCache) from the live scraper doc."""
    doc = db.document(SCRAPER_DOC).get()
    data = doc.to_dict() or {}
    return (
        set(data.get("processedDiscUrls", [])),
        data.get("summaryDiscCache", {}),
    )


def _save_live_cursor(
    db: firestore.Client,
    processed: set[str],
    cache: dict[str, list[str]],
) -> None:
    db.document(SCRAPER_DOC).set(
        {"processedDiscUrls": list(processed), "summaryDiscCache": cache},
        merge=True,
    )


def _is_backfill_processed(db: firestore.Client, disc_url: str) -> bool:
    h = hashlib.sha256(disc_url.encode()).hexdigest()[:40]
    return db.document(BACKFILL_DOC).collection(BACKFILL_URLS_COLLECTION).document(h).get().exists


def _mark_backfill_processed(db: firestore.Client, disc_url: str) -> None:
    h = hashlib.sha256(disc_url.encode()).hexdigest()[:40]
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
    processed, cache = _load_live_cursor(db) if db is not None else (set(), {})

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
            # Use cached disc URLs for prior years; always re-check current year
            disc_urls = cache.get(summary_url)
            if disc_urls is None or year == current_year:
                try:
                    meta = fetch_disclosure_meta(session, summary_url)
                    disc_urls = meta.disclosure_urls
                    cache[summary_url] = disc_urls
                    if not dry_run:
                        _save_live_cursor(db, processed, cache)
                except Exception as e:
                    print(f"  failed to fetch summary {summary_url}: {e}", file=sys.stderr)
                    continue

            new_disc_urls = [u for u in disc_urls if u not in processed]
            if not new_disc_urls:
                continue

            for disc_url in new_disc_urls:
                try:
                    comp_n, filing_n = process_disclosure(
                        db, session, summary_url, disc_url, year, dry_run=dry_run
                    )
                    processed.add(disc_url)
                    new_count += 1
                    print(f"  processed: {comp_n} clients, {filing_n} filings")
                    if not dry_run:
                        _save_live_cursor(db, processed, cache)
                except Exception as e:
                    print(f"  failed to process {disc_url}: {e}", file=sys.stderr)

    return new_count


# ── Historical backfill ───────────────────────────────────────────────────────


def _completed_years(db: "firestore.Client") -> set[int]:
    data = db.document(BACKFILL_DOC).get().to_dict() or {}
    return set(data.get("completedYears", []))


def _mark_year_complete(db: "firestore.Client", year: int) -> None:
    db.document(BACKFILL_DOC).set(
        {"completedYears": firestore.ArrayUnion([year])}, merge=True
    )


def run_backfill(
    db: "firestore.Client | None",
    years: list[int],
    limit: int | None = None,
    dry_run: bool = False,
) -> int:
    """Full historical backfill using the subcollection cursor. Resumable."""
    session = make_session()
    total_new = 0

    done = _completed_years(db) if db is not None and not dry_run else set()
    if done:
        print(f"Skipping already-completed years: {sorted(done)}")

    for year in years:
        if year in done:
            continue

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
        if db is not None and not dry_run and not limit:
            _mark_year_complete(db, year)

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

    # Recompute aggregate stats after any run that wrote new data.
    # Skip when --limit is set (partial run would produce inaccurate totals).
    if db is not None and not args.dry_run and not args.limit and n > 0:
        compute_stats(db)

    # Emit structured result for callers (e.g. TypeScript backfill script)
    print(json.dumps({"newDisclosures": n}), file=sys.stderr)


if __name__ == "__main__":
    main()
