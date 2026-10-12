"""One-off migration: rebuild lobbying registrants and filings from the archive.

Corrects two problems in data written by earlier scraper versions, both of
which change Firestore doc ids:

1. filing_id() omitted the reporting period, so a bill position re-reported in
   several periods of one general court collided onto one doc (last write won,
   including its "year").
2. Disclosures were credited to whichever summary page the scraper reached
   them from first. The portal links a firm's disclosure from each of its
   lobbyists' summary pages as well as the firm's own, so firm disclosures were
   often credited to an individual lobbyist (or to several). They are now
   credited to the filer named on the page (see portal.resolve_filer).
3. Registration pages were discarded, so lobbyists whose firm files for them
   had no record. Registrations are now stored in lobbyingRegistrations.

Every registrant and filing doc is regenerated from the raw-HTML archive, then
docs that weren't regenerated are deleted. Registrations are written from the
archived registration pages (additive; nothing is deleted).

Phases (run in order, per project):

    write    Snapshot which registrants currently list each disclosure URL, then
             reparse every archived CompleteDisclosure page: write its filings,
             and write each registrant doc once (full overwrite, all of its
             disclosure URLs). Records the correct ids and a summary under
             --out-prefix.
    cleanup  For --collection filings|registrants, diff live doc ids against
             the recorded ids. Dry run by default; the dry run prints the exact
             --execute command, which refuses to delete unless the project,
             the id count and the stale count all match and the write phase
             finished with nothing unaccounted for.
    registrations
             Parse every archived registration page (Summary.aspx) and write one
             lobbyingRegistrations doc per registrant and year. Before 2019 the
             portal served several identical pages per firm per year; they
             collapse into one doc listing all their URLs.
    refetch-errors
             Find archived pages that are portal error pages ("An Error
             Occurred") instead of content, and with --execute re-fetch them
             from the live portal into the archive. Run before the phases above.
    stats    Recompute lobbyingMeta.

    GOOGLE_APPLICATION_CREDENTIALS=... python3 migrate_lobbying_data.py \\
      --project <project> --phase write --out-prefix /tmp/<project>
    GOOGLE_APPLICATION_CREDENTIALS=... python3 migrate_lobbying_data.py \\
      --project <project> --phase cleanup --collection filings --out-prefix /tmp/<project>
    (same for --collection registrants), then --phase registrations, then
    --phase stats.

Safe to delete once dev and prod have both been migrated.
"""
from __future__ import annotations

import argparse
import json
import os
import time

# archive.py reads ARCHIVE_RAW when imported; refetch-errors relies on it to
# save re-fetched pages.
os.environ["ARCHIVE_RAW"] = "1"

from concurrent.futures import ThreadPoolExecutor, as_completed

from bs4 import BeautifulSoup
from google.cloud import firestore, storage
from google.cloud.storage import Blob

import archive
from portal import (
    DisclosureMeta,
    _get,
    make_session,
    parse_registration,
    filing_id,
    parse_disclosure_detail,
    resolve_filer,
    year_to_general_court,
)
from writer import (
    FILINGS_COLLECTION,
    REGISTRANTS_COLLECTION,
    compute_stats,
    REGISTRATIONS_COLLECTION,
    registrant_doc,
    registration_doc,
    write_filings,
)

_DEFAULT_WORKERS = 20
_COLLECTIONS = {"filings": FILINGS_COLLECTION, "registrants": REGISTRANTS_COLLECTION}


def _paginate(db: firestore.Client, collection: str, fields: list[str]):
    last = None
    while True:
        q = db.collection(collection).select(fields).order_by("__name__").limit(5000)
        if last is not None:
            q = q.start_after(last)
        page = list(q.stream())
        if not page:
            return
        yield from page
        last = page[-1]


def snapshot_owners(db: firestore.Client) -> dict[str, list[DisclosureMeta]]:
    """Map each disclosure URL to the registrants currently listing it."""
    owners: dict[str, list[DisclosureMeta]] = {}
    for doc in _paginate(db, REGISTRANTS_COLLECTION, ["entityName", "year", "regType", "disclosureUrls"]):
        d = doc.to_dict()
        meta = DisclosureMeta(
            entity_name=d.get("entityName", ""),
            year=d.get("year"),
            reg_type=d.get("regType", "Lobbyist"),
        )
        for url in d.get("disclosureUrls") or []:
            owners.setdefault(url, []).append(meta)
    return owners


def load_or_snapshot_owners(db: firestore.Client, path: str) -> dict[str, list[DisclosureMeta]]:
    """Ownership must come from the registrants as they were before the
    migration: the write phase overwrites registrant docs, so re-reading them
    after a partial run would silently drop pages that run didn't process.
    The first run saves the snapshot; later runs reuse it."""
    if os.path.exists(path):
        with open(path) as f:
            raw = json.load(f)
        print(f"Loaded ownership snapshot {path}")
    else:
        raw = {
            url: [[m.entity_name, m.year, m.reg_type] for m in metas]
            for url, metas in snapshot_owners(db).items()
        }
        with open(path, "w") as f:
            json.dump(raw, f)
        print(f"Saved ownership snapshot {path}")
    return {
        url: [DisclosureMeta(entity_name=o[0], year=o[1], reg_type=o[2]) for o in metas]
        for url, metas in raw.items()
    }


def choose_owner(owners: list[DisclosureMeta]) -> DisclosureMeta:
    """Deterministic pick among the registrants linking a page. Firm pages
    are re-credited from the page itself, so this only decides individual
    pages, where a Lobbyist owner is preferred."""
    return sorted(owners, key=lambda m: (m.reg_type != "Lobbyist", m.entity_name))[0]


def _process_page_once(db: firestore.Client, blob: Blob, owner: DisclosureMeta, url: str) -> dict:
    soup = BeautifulSoup(_download(blob), "html.parser")
    detail = parse_disclosure_detail(soup, owner.year)
    built = registrant_doc(owner, detail)
    if built is None:
        return {"status": "unattributable", "url": url}
    rid, data = built
    filer = resolve_filer(owner, detail)
    gc = year_to_general_court(filer.year)
    fids = [
        filing_id(filer.entity_name, b.client_name, b.chamber, b.bill_id,
                  gc, b.position, detail.period_start)
        for b in detail.bills
    ]
    write_filings(db, owner, detail, url)
    return {"status": "processed", "url": url, "rid": rid, "data": data, "fids": fids,
            "reattributed": filer.entity_name != owner.entity_name}


def _process_page(db: firestore.Client, blob: Blob, owner: DisclosureMeta, url: str) -> dict:
    # Retry the whole page (read, parse, writes are all idempotent) so a brief
    # network outage doesn't leave it stale, and never let an exception escape
    # to future.result(), which would abort the accounting loop.
    for attempt in range(3):
        try:
            return _process_page_once(db, blob, owner, url)
        except Exception as exc:
            if attempt == 2:
                print(f"  ERROR processing {url}: {exc}")
                return {"status": "error", "url": url}
            time.sleep(5 * 2 ** attempt)


def run_write(project: str, out_prefix: str, workers: int, limit: int | None) -> None:
    db = firestore.Client(project=project)
    print(f"Target project: {db.project}")

    owners = load_or_snapshot_owners(db, f"{out_prefix}.owners.json")
    print(f"Snapshot: {len(owners)} disclosure URLs listed by registrants")

    os.environ["GOOGLE_CLOUD_PROJECT"] = project
    bucket = storage.Client(project=project).bucket(archive._get_bucket_name())
    pages = []
    for blob in bucket.list_blobs(prefix="raw_html/"):
        url = (blob.metadata or {}).get("source-url", "")
        if url in owners:
            pages.append((blob, url))
    archived = {url for _, url in pages}
    missing = sorted(set(owners) - archived)
    print(f"Archived pages to process: {len(pages)}; listed URLs missing from archive: {len(missing)}")
    if limit is not None:
        pages = pages[:limit]

    counts = {"processed": 0, "unattributable": 0, "error": 0, "reattributed": 0}
    registrants: dict[str, dict] = {}
    all_fids: set[str] = set()
    problem_urls: list[str] = []

    with ThreadPoolExecutor(max_workers=workers) as pool:
        futures = {
            pool.submit(_process_page, db, blob, choose_owner(owners[url]), url): url
            for blob, url in pages
        }
        for done, future in enumerate(as_completed(futures), 1):
            try:
                r = future.result()
            except Exception as exc:
                print(f"  ERROR (uncaught) processing {futures[future]}: {exc}")
                r = {"status": "error", "url": futures[future]}
            counts[r["status"]] += 1
            if r["status"] != "processed":
                problem_urls.append(r["url"])
            else:
                counts["reattributed"] += r["reattributed"]
                all_fids.update(r["fids"])
                entry = registrants.setdefault(r["rid"], {"urls": set(), "data": None, "data_url": None})
                entry["urls"].add(r["url"])
                # Several pages can map to one registrant (e.g. an amended
                # disclosure for the same period); keep a deterministic one.
                if entry["data_url"] is None or r["url"] > entry["data_url"]:
                    entry["data"], entry["data_url"] = r["data"], r["url"]
            if done % 2000 == 0 or done == len(pages):
                print(f"  [{done}/{len(pages)}] {counts}, {len(all_fids)} filing ids, {len(registrants)} registrants")

    # A registrant doc is overwritten with the URLs of the pages processed in
    # this run, so a partial run (--limit) would drop its other pages' URLs.
    to_write = {} if limit is not None else registrants
    print(f"\nWriting {len(to_write)} registrant docs (full overwrite)"
          + (" — skipped for a --limit run" if limit is not None else "") + "…")
    coll = db.collection(REGISTRANTS_COLLECTION)
    batch, n = db.batch(), 0
    for rid, entry in to_write.items():
        doc = dict(entry["data"], disclosureUrls=sorted(entry["urls"]), fetchedAt=firestore.SERVER_TIMESTAMP)
        batch.set(coll.document(rid), doc)
        n += 1
        if n % 400 == 0:
            batch.commit()
            batch = db.batch()
    if n % 400:
        batch.commit()

    with open(f"{out_prefix}.filings.txt", "w") as f:
        f.writelines(fid + "\n" for fid in sorted(all_fids))
    with open(f"{out_prefix}.registrants.txt", "w") as f:
        f.writelines(rid + "\n" for rid in sorted(registrants))
    summary = {
        "project": project,
        "limit": limit,
        **counts,
        "listed_urls": len(owners),
        "missing_from_archive": len(missing),
        "filing_ids": len(all_fids),
        "registrant_ids": len(registrants),
        "registrants_with_multiple_pages": sum(len(e["urls"]) > 1 for e in registrants.values()),
        "problem_urls": problem_urls[:50],
        "missing_urls": missing[:50],
    }
    with open(f"{out_prefix}.summary.json", "w") as f:
        json.dump(summary, f, indent=2)
    print(json.dumps({k: v for k, v in summary.items() if not k.endswith("_urls")}, indent=2))


def run_cleanup(project: str, out_prefix: str, collection: str, execute: bool,
                expect_ids: int | None, expect_stale: int | None) -> None:
    with open(f"{out_prefix}.summary.json") as f:
        summary = json.load(f)
    # Anything the write phase couldn't regenerate would look stale and be
    # deleted, so refuse unless every listed page was accounted for.
    blockers = {k: summary[k] for k in ("error", "unattributable", "missing_from_archive") if summary[k]}
    if summary["processed"] != summary["listed_urls"]:
        blockers["pages_not_processed"] = summary["listed_urls"] - summary["processed"]
    if summary["project"] != project:
        blockers["summary_project"] = summary["project"]
    if summary.get("limit") is not None:
        blockers["write_phase_was_limited"] = summary["limit"]

    with open(f"{out_prefix}.{collection}.txt") as f:
        correct = {line.strip() for line in f if line.strip()}
    print(f"Loaded {len(correct)} correct {collection} ids")

    db = firestore.Client(project=project)
    name = _COLLECTIONS[collection]
    print(f"Target: {db.project}/{name}")
    total, stale = 0, []
    for doc in _paginate(db, name, []):
        total += 1
        if doc.id not in correct:
            stale.append(doc.reference)
        if total % 100000 == 0:
            print(f"  scanned {total}, stale so far {len(stale)}")
    print(f"\nScanned {total} docs; stale: {len(stale)}; kept: {total - len(stale)}")

    if not execute:
        if blockers:
            print(f"Write phase not clean, deletion would be refused: {blockers}")
        print(f"Dry run — nothing deleted. To delete: --phase cleanup --collection {collection} "
              f"--project {project} --out-prefix {out_prefix} --execute "
              f"--expect-ids {len(correct)} --expect-stale {len(stale)}")
        return

    if blockers:
        raise SystemExit(f"ABORT: write phase not clean {blockers}. Nothing deleted.")
    if expect_ids is None or expect_stale is None:
        raise SystemExit("ABORT: --execute requires --expect-ids and --expect-stale from a dry run.")
    if len(correct) != expect_ids or len(stale) != expect_stale:
        raise SystemExit(
            f"ABORT: ids {len(correct)} (expected {expect_ids}), stale {len(stale)} "
            f"(expected {expect_stale}). Nothing deleted."
        )
    for ref in stale:
        if ref.parent.id != name or ref.parent.parent is not None:
            raise SystemExit(f"ABORT: unexpected doc path {ref.path}. Nothing deleted.")

    batch, count = db.batch(), 0
    for ref in stale:
        batch.delete(ref)
        count += 1
        if count % 400 == 0:
            batch.commit()
            batch = db.batch()
            if count % 20000 == 0:
                print(f"  deleted {count}/{len(stale)}")
    if count % 400:
        batch.commit()
    print(f"Deleted {count} stale {collection} docs.")


def _archived_pages(project: str, kind: str) -> list[tuple[Blob, str]]:
    os.environ["GOOGLE_CLOUD_PROJECT"] = project
    bucket = storage.Client(project=project).bucket(archive._get_bucket_name())
    pages = []
    for blob in bucket.list_blobs(prefix="raw_html/"):
        url = (blob.metadata or {}).get("source-url", "")
        if kind in url:
            pages.append((blob, url))
    return pages


def _download(blob: Blob) -> str:
    for attempt in range(3):
        try:
            return blob.download_as_text(encoding="utf-8")
        except Exception:
            if attempt == 2:
                raise


def _is_error_page(html: str) -> bool:
    return "An Error Occurred" in html and "There was a problem opening" in html


def run_registrations(project: str, out_prefix: str, workers: int) -> None:
    db = firestore.Client(project=project)
    print(f"Target project: {db.project}")
    pages = _archived_pages(project, "Summary.aspx")
    print(f"Archived registration pages: {len(pages)}")

    def parse(page):
        blob, url = page
        try:
            return url, parse_registration(BeautifulSoup(_download(blob), "html.parser"), url), None
        except Exception as exc:
            return url, None, str(exc)

    by_id: dict[str, dict] = {}
    unreadable, errors = [], []
    with ThreadPoolExecutor(max_workers=workers) as pool:
        for done, (url, reg, err) in enumerate(pool.map(parse, pages), 1):
            if err:
                errors.append(url)
            elif reg is None:
                unreadable.append(url)
            else:
                doc_id, data = registration_doc(reg)
                entry = by_id.setdefault(doc_id, {"data": data, "urls": set()})
                entry["urls"].add(url)
            if done % 5000 == 0 or done == len(pages):
                print(f"  [{done}/{len(pages)}] {len(by_id)} registrations, {len(unreadable)} unreadable, {len(errors)} errors")

    coll = db.collection(REGISTRATIONS_COLLECTION)
    batch, n = db.batch(), 0
    for doc_id, entry in by_id.items():
        doc = dict(entry["data"], sourceUrls=sorted(entry["urls"]), fetchedAt=firestore.SERVER_TIMESTAMP)
        batch.set(coll.document(doc_id), doc)
        n += 1
        if n % 400 == 0:
            batch.commit()
            batch = db.batch()
    if n % 400:
        batch.commit()

    with open(f"{out_prefix}.registrations.txt", "w") as f:
        f.writelines(doc_id + "\n" for doc_id in sorted(by_id))
    summary = {
        "project": project,
        "pages": len(pages),
        "registrations": len(by_id),
        "pages_collapsed_as_duplicates": len(pages) - len(unreadable) - len(errors) - len(by_id),
        "unreadable": len(unreadable),
        "errors": len(errors),
        "unreadable_urls": unreadable[:50],
        "error_urls": errors[:50],
    }
    with open(f"{out_prefix}.registrations.summary.json", "w") as f:
        json.dump(summary, f, indent=2)
    print(json.dumps({k: v for k, v in summary.items() if not k.endswith("_urls")}, indent=2))


def run_refetch_errors(project: str, workers: int, execute: bool) -> None:
    pages = _archived_pages(project, ".aspx")
    print(f"Archived pages: {len(pages)}")

    def check(page):
        blob, url = page
        try:
            return url, _is_error_page(_download(blob))
        except Exception:
            return url, None

    bad, unchecked = [], []
    with ThreadPoolExecutor(max_workers=workers) as pool:
        for done, (url, is_error) in enumerate(pool.map(check, pages), 1):
            if is_error:
                bad.append(url)
            elif is_error is None:
                unchecked.append(url)
            if done % 10000 == 0 or done == len(pages):
                print(f"  [{done}/{len(pages)}] {len(bad)} error pages, {len(unchecked)} unchecked")
    print(f"Error pages stored in place of content: {len(bad)}")
    for url in bad:
        print("  ", url)
    if unchecked:
        # A failed download says nothing about the page; rerun to check these.
        print(f"Could not download {len(unchecked)} pages to check them; rerun the scan.")
    if not execute:
        print("Dry run — nothing fetched. Re-run with --execute to re-fetch them from the portal.")
        return

    # _get saves each fetched page to the archive (ARCHIVE_RAW is set in main),
    # and paces requests to the portal.
    session = make_session()
    still_bad = 0
    for url in bad:
        try:
            html = str(_get(session, url))
        except Exception as exc:
            html = ""
            print("  fetch failed:", url, exc)
        if not html or _is_error_page(html):
            still_bad += 1
            print("  still not fetched:", url)
    print(f"Re-fetched {len(bad)} pages; {still_bad} still return an error page.")


def main() -> None:
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--project", required=True)
    p.add_argument("--phase", required=True,
                   choices=["write", "cleanup", "registrations", "refetch-errors", "stats"])
    p.add_argument("--out-prefix", help="write/cleanup: path prefix for recorded ids and summary")
    p.add_argument("--collection", choices=sorted(_COLLECTIONS), help="cleanup: which collection")
    p.add_argument("--workers", type=int, default=_DEFAULT_WORKERS)
    p.add_argument("--limit", type=int, default=None, help="write: only N pages (testing; blocks cleanup)")
    p.add_argument("--execute", action="store_true",
                   help="cleanup: actually delete; refetch-errors: actually re-fetch")
    p.add_argument("--expect-ids", type=int, default=None)
    p.add_argument("--expect-stale", type=int, default=None)
    args = p.parse_args()

    if args.phase == "write":
        run_write(args.project, args.out_prefix, args.workers, args.limit)
    elif args.phase == "registrations":
        run_registrations(args.project, args.out_prefix, args.workers)
    elif args.phase == "refetch-errors":
        run_refetch_errors(args.project, args.workers, args.execute)
    elif args.phase == "cleanup":
        if not args.collection:
            p.error("--collection is required for cleanup")
        run_cleanup(args.project, args.out_prefix, args.collection, args.execute,
                    args.expect_ids, args.expect_stale)
    else:
        compute_stats(firestore.Client(project=args.project))


if __name__ == "__main__":
    main()
