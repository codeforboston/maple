"""Firestore document construction and write helpers.

Mirrors the data model in functions/src/lobbying/types.ts. All collection
names and field names must stay in sync with that file.
"""

from __future__ import annotations

from datetime import datetime, timezone

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
BACKFILL_DOC = "scrapers/lobbyingBackfill"
BACKFILL_URLS_COLLECTION = "processedUrls"


def _now() -> datetime:
    return datetime.now(tz=timezone.utc)


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
