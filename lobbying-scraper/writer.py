"""Firestore document construction and write helpers.

Mirrors the data model in functions/src/lobbying/types.ts. All collection
names and field names must stay in sync with that file.
"""

from __future__ import annotations

import time
import urllib.parse
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

# Sentinel clientName used for pre-2013 legacy filings where compensation is
# reported as a single total rather than broken down per client. Must match
# LEGACY_TOTAL_CLIENT in functions/src/lobbying/types.ts.
LEGACY_TOTAL_CLIENT = "_total_salary_"


def _is_legacy_total_client(name: str | None, name_norm: str | None) -> bool:
    if not name_norm or name_norm == LEGACY_TOTAL_CLIENT:
        return True
    if name == LEGACY_TOTAL_CLIENT:
        return True
    lc = (name or "").lower()
    return "total salaries" in lc or "total salary" in lc


def _doc_id_for_norm(name_norm: str) -> str:
    """Firestore doc ID for a normalized name — matches JS encodeURIComponent()
    exactly (same unreserved character set: alnum, - _ . ! ~ * ' ( )), so the
    frontend can look up a single summary doc directly via
    encodeURIComponent(clientNameNorm) without scanning the whole
    subcollection.
    """
    return urllib.parse.quote(name_norm, safe="!*'()")

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

    # Per-client and per-firm rollups, computed here (over the full,
    # paginated registrants scan) instead of client-side in the frontend,
    # which previously fetched only the first 2,000 of 25,000+ registrant
    # docs (Firestore query limit) — silently showing an incomplete client
    # and firm list. See pages/lobbying/clients/index.tsx and
    # pages/lobbying/firms/index.tsx.
    client_summaries: dict[str, dict] = {}
    firm_summaries: dict[str, dict] = {}

    for doc in _iter_collection(db, REGISTRANTS_COLLECTION):
        d = doc.to_dict()
        year = d.get("year")
        year_str = str(year) if year is not None else ""
        entity_name = d.get("entityName")
        entity_norm = d.get("entityNameNorm")
        reg_type = d.get("regType")
        clients = d.get("clients", [])

        if entity_norm:
            firm = firm_summaries.setdefault(
                entity_norm,
                {
                    "entityName": entity_name or entity_norm,
                    "entityNameNorm": entity_norm,
                    "regType": reg_type or "",
                    "years": set(),
                    "clientCount": 0,
                },
            )
            if year is not None:
                firm["years"].add(year)
            if reg_type:
                firm["regType"] = reg_type
            # Matches the frontend's prior groupByFirm() semantics exactly:
            # sum of raw clients[] array length, unfiltered.
            firm["clientCount"] += len(clients)

        for c in clients:
            norm = c.get("clientNameNorm")
            name = c.get("clientName")
            comp = c.get("compensation")

            if comp is not None and year_str:
                spend_by_year[year_str] = spend_by_year.get(year_str, 0) + comp

            if _is_legacy_total_client(name, norm):
                continue

            client_norms.add(norm)

            cs = client_summaries.setdefault(
                norm,
                {
                    "clientName": name or norm,
                    "clientNameNorm": norm,
                    "totalCompensation": None,
                    "registrantCount": 0,
                    "firms": {},
                },
            )
            cs["registrantCount"] += 1
            if comp is not None:
                cs["totalCompensation"] = (cs["totalCompensation"] or 0) + comp

            if entity_norm:
                fb = cs["firms"].setdefault(
                    entity_norm,
                    {
                        "entityName": entity_name or entity_norm,
                        "entityNameNorm": entity_norm,
                        "compensation": None,
                    },
                )
                if comp is not None:
                    fb["compensation"] = (fb["compensation"] or 0) + comp

        total_registrants += 1

    for cs in client_summaries.values():
        cs["firms"] = sorted(
            cs["firms"].values(), key=lambda f: f["entityNameNorm"]
        )
    for fs in firm_summaries.values():
        fs["years"] = sorted(fs["years"], reverse=True)

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

    # Client and firm summaries: same one-small-doc-per-item subcollection
    # pattern as billSummaries above (avoids the 1MB per-document/field
    # limit — at ~5,300 clients and ~4,800 firms this is already close to
    # that ceiling as a single blob/map).
    client_parent = db.collection(STATS_COLLECTION).document("clientSummaries")
    client_parent.set(
        {"count": len(client_summaries), "updatedAt": _now().isoformat()}
    )
    client_coll = client_parent.collection("clients")
    batch = db.batch()
    count = 0
    for norm, cs in client_summaries.items():
        batch.set(client_coll.document(_doc_id_for_norm(norm)), cs)
        count += 1
        if count % 400 == 0:
            batch.commit()
            batch = db.batch()
    if count % 400 != 0:
        batch.commit()

    firm_parent = db.collection(STATS_COLLECTION).document("firmSummaries")
    firm_parent.set({"count": len(firm_summaries), "updatedAt": _now().isoformat()})
    firm_coll = firm_parent.collection("firms")
    batch = db.batch()
    count = 0
    for norm, fs in firm_summaries.items():
        batch.set(firm_coll.document(_doc_id_for_norm(norm)), fs)
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
        f"bill summaries for courts {sorted(bill_summaries.keys())}, "
        f"{len(client_summaries)} client summaries, {len(firm_summaries)} firm summaries"
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
