"""Firestore document construction and write helpers.

Mirrors the data model in functions/src/lobbying/types.ts. All collection
names and field names must stay in sync with that file.
"""

from __future__ import annotations

import time
from datetime import datetime, timezone

from google.api_core.exceptions import GoogleAPICallError
from google.cloud import firestore
from normalize import normalize_entity_name
from portal import (
    BillActivity,
    Compensation,
    DisclosureDetail,
    DisclosureMeta,
    filing_id,
    registrant_id,
    year_to_general_court,
)

REGISTRANTS_COLLECTION = "lobbyingRegistrants"
FILINGS_COLLECTION = "lobbyingFilings"
SCRAPER_DOC = "scrapers/lobbying"
PROCESSED_URLS_COLLECTION = "processedUrls"
SUMMARY_CACHE_COLLECTION = "summaryCache"
BACKFILL_DOC = "scrapers/lobbyingBackfill"
BACKFILL_URLS_COLLECTION = "processedUrls"
STATS_COLLECTION = "lobbyingMeta"
STATS_DOC_ID = "stats"

# compute_stats() streams the full filings/registrants collections, which at
# MAPLE's current scale (300K+ docs) can exceed Firestore's server-side query
# timeout. Batching with an explicit cursor keeps each individual RPC small
# and fast; retry=None disables the client library's built-in stream-retry
# (which has a version-skew bug that crashes instead of retrying), and the
# manual retry loop below just re-issues a fresh, small query on failure
# instead of trying to resume a broken stream.
_BATCH_SIZE = 50000
_MAX_RETRIES = 3


def _iter_collection(db: firestore.Client, collection_name: str):
    """Yield every document in a collection via small, cursor-paginated reads."""
    coll_ref = db.collection(collection_name)
    last_doc = None

    while True:
        query = coll_ref.order_by("__name__").limit(_BATCH_SIZE)
        if last_doc is not None:
            query = query.start_after(last_doc)

        for attempt in range(_MAX_RETRIES):
            try:
                batch = list(query.stream(retry=None))
                break
            except GoogleAPICallError as e:
                if attempt == _MAX_RETRIES - 1:
                    raise
                print(
                    f"  batch read failed ({e}); retrying "
                    f"({attempt + 1}/{_MAX_RETRIES})…"
                )
                time.sleep(2**attempt)

        if not batch:
            return

        yield from batch
        last_doc = batch[-1]

        if len(batch) < _BATCH_SIZE:
            return


def _now() -> datetime:
    return datetime.now(tz=timezone.utc)


def _normalize_position(raw: str | None) -> str:
    if not raw:
        return "none"
    s = raw.lower().strip()
    if s.startswith("support"):
        return "support"
    if s.startswith("oppose") or s.startswith("against"):
        return "oppose"
    if s.startswith("neutral") or s.startswith("monitor"):
        return "neutral"
    return "none"


def compute_stats(db: firestore.Client) -> None:
    """Recompute and write the lobbyingMeta/stats singleton from raw collections."""
    print("\nRecomputing stats…")
    bills: set[str] = set()
    courts: set[int] = set()
    filings_by_year: dict[str, int] = {}
    entity_filing_counts: dict[str, int] = {}
    client_filing_counts: dict[str, int] = {}
    bill_summaries: dict[int, dict[str, dict]] = {}
    bill_client_sets: dict[int, dict[str, set]] = {}
    bill_entity_sets: dict[int, dict[str, set]] = {}
    total_filings = 0

    for doc in _iter_collection(db, FILINGS_COLLECTION):
        d = doc.to_dict()
        year = str(d.get("year", ""))
        gc = d.get("generalCourt")
        bill_id = d.get("billId")
        if bill_id and len(bill_id) > 2 and gc:
            bills.add(f"{gc}/{bill_id}")
            pos = _normalize_position(d.get("position"))
            if gc not in bill_summaries:
                bill_summaries[gc] = {}
                bill_client_sets[gc] = {}
                bill_entity_sets[gc] = {}
            if bill_id not in bill_summaries[gc]:
                bill_summaries[gc][bill_id] = {
                    "total": 0,
                    "support": 0,
                    "oppose": 0,
                    "neutral": 0,
                    "none": 0,
                    "title": d.get("activityTitle") or "",
                    "clients": 0,
                    "lobbyists": 0,
                }
                bill_client_sets[gc][bill_id] = set()
                bill_entity_sets[gc][bill_id] = set()
            bill_summaries[gc][bill_id]["total"] += 1
            bill_summaries[gc][bill_id][pos] += 1
            cn = d.get("clientNameNorm")
            en = d.get("entityNameNorm")
            if cn:
                bill_client_sets[gc][bill_id].add(cn)
            if en:
                bill_entity_sets[gc][bill_id].add(en)
        if gc:
            courts.add(gc)
        if year:
            filings_by_year[year] = filings_by_year.get(year, 0) + 1
        total_filings += 1
        en = d.get("entityNameNorm")
        cn = d.get("clientNameNorm")
        if en:
            entity_filing_counts[en] = entity_filing_counts.get(en, 0) + 1
        if cn:
            client_filing_counts[cn] = client_filing_counts.get(cn, 0) + 1

    for gc, bills_map in bill_summaries.items():
        for bill_id, counts in bills_map.items():
            counts["clients"] = len(bill_client_sets.get(gc, {}).get(bill_id, set()))
            counts["lobbyists"] = len(bill_entity_sets.get(gc, {}).get(bill_id, set()))

    client_norms: set[str] = set()
    spend_by_year: dict[str, float] = {}
    total_registrants = 0

    for doc in _iter_collection(db, REGISTRANTS_COLLECTION):
        d = doc.to_dict()
        year = str(d.get("year", ""))
        for c in d.get("clients", []):
            norm = c.get("clientNameNorm")
            if norm:
                client_norms.add(norm)
            comp = c.get("compensation")
            if comp is not None and year:
                spend_by_year[year] = spend_by_year.get(year, 0) + comp
        total_registrants += 1

    stats = {
        "totalFilings": total_filings,
        "totalRegistrants": total_registrants,
        "totalClients": len(client_norms),
        "totalBillsWithFilings": len(bills),
        "courtsWithData": sorted(courts),
        "spendByYear": spend_by_year,
        "filingsByYear": filings_by_year,
    }
    db.collection(STATS_COLLECTION).document(STATS_DOC_ID).set(stats, merge=True)
    db.collection(STATS_COLLECTION).document("entityFilingCounts").set(
        entity_filing_counts
    )
    db.collection(STATS_COLLECTION).document("clientFilingCounts").set(
        client_filing_counts
    )
    for gc, bills_map in bill_summaries.items():
        # One small doc per bill, not one JSON blob per court: a court's blob
        # eventually exceeds Firestore's 1MB field-size limit as its session
        # accumulates filings (hit at 1,057KB for court 194 with ~5,600
        # bills). Per-bill docs have no such ceiling.
        parent_ref = db.collection(STATS_COLLECTION).document(f"billSummaries_{gc}")
        parent_ref.set(
            {"billCount": len(bills_map), "updatedAt": _now().isoformat()}
        )
        bills_coll = parent_ref.collection("bills")
        batch = db.batch()
        count = 0
        for bill_id, counts in bills_map.items():
            batch.set(bills_coll.document(bill_id), counts)
            count += 1
            if count % 400 == 0:
                batch.commit()
                batch = db.batch()
        if count % 400 != 0:
            batch.commit()
    print(
        f"  stats written: {total_filings} filings, "
        f"{total_registrants} registrants, {len(client_norms)} clients, "
        f"{len(entity_filing_counts)} entities, {len(client_filing_counts)} client norms, "
        f"bill summaries for courts {sorted(bill_summaries.keys())}"
    )


def write_registrant(
    db: firestore.Client,
    meta: DisclosureMeta,
    detail: DisclosureDetail,
    disc_url: str,
) -> None:
    """Upsert a LobbyingRegistrant document."""
    if not meta.entity_name or meta.year is None:
        return

    doc_id = registrant_id(meta.entity_name, meta.year)
    ref = db.collection(REGISTRANTS_COLLECTION).document(doc_id)

    clients = [
        {
            "clientName": c.client_name,
            "clientNameNorm": normalize_entity_name(c.client_name),
            "compensation": c.amount,
        }
        for c in detail.compensation
    ]

    data = {
        "registrantId": doc_id,
        "entityName": meta.entity_name,
        "entityNameNorm": normalize_entity_name(meta.entity_name),
        "year": meta.year,
        "generalCourt": year_to_general_court(meta.year),
        "regType": meta.reg_type,
        "clients": clients,
        "legacyTotalCompensation": detail.legacy_total_compensation,
        "disclosureUrls": firestore.ArrayUnion([disc_url]),
        "fetchedAt": _now(),
    }
    ref.set(data, merge=True)


def write_filings(
    db: firestore.Client,
    meta: DisclosureMeta,
    detail: DisclosureDetail,
) -> int:
    """Batch-write LobbyingFiling documents. Returns the number written."""
    if not meta.entity_name or meta.year is None or not detail.bills:
        return 0

    gc = year_to_general_court(meta.year)
    entity_name = meta.entity_name
    entity_norm = normalize_entity_name(entity_name)
    now = _now()

    batch = db.batch()
    count = 0

    for bill in detail.bills:
        fid = filing_id(
            entity_name,
            bill.client_name,
            bill.chamber,
            bill.bill_id,
            gc,
            bill.position,
        )
        ref = db.collection(FILINGS_COLLECTION).document(fid)
        doc = {
            "filingId": fid,
            "entityName": entity_name,
            "entityNameNorm": entity_norm,
            "clientName": bill.client_name,
            "clientNameNorm": normalize_entity_name(bill.client_name),
            "year": meta.year,
            "generalCourt": gc,
            "chamber": bill.chamber,
            "billId": bill.bill_id,
            "activityTitle": bill.activity_title,
            "position": bill.position,
            "amount": bill.amount,
            "fetchedAt": now,
        }
        batch.set(ref, doc)
        count += 1

        # Firestore batch limit is 500 writes
        if count % 400 == 0:
            batch.commit()
            batch = db.batch()

    if count % 400 != 0:
        batch.commit()

    return count
