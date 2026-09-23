"""Unit tests for Firestore document construction in writer.py.

Uses unittest.mock to intercept Firestore calls so no live database is needed.
"""

from __future__ import annotations

import sys
from pathlib import Path
from unittest.mock import MagicMock, patch, call

import pytest

sys.path.insert(0, str(Path(__file__).parent.parent))

from portal import (
    BillActivity,
    Compensation,
    DisclosureDetail,
    DisclosureMeta,
    registrant_id,
)
from writer import (
    write_registrant,
    write_filings,
    compute_stats,
    REGISTRANTS_COLLECTION,
    STATS_DOC_ID,
)


# ── Helpers ───────────────────────────────────────────────────────────────────


def _make_db():
    """Return a MagicMock that behaves like firestore.Client."""
    db = MagicMock()
    # db.collection(x).document(y).set(data, merge=True)
    doc_ref = MagicMock()
    db.collection.return_value.document.return_value = doc_ref
    return db, doc_ref


def _captured_data(doc_ref) -> dict:
    """Return the dict passed to the most recent doc_ref.set() call."""
    assert doc_ref.set.called, "set() was never called"
    args, kwargs = doc_ref.set.call_args
    return args[0]


def _meta(entity_name="Acme Lobbying LLC", year=2024, reg_type="Employer"):
    return DisclosureMeta(entity_name=entity_name, year=year, reg_type=reg_type)


# ── write_registrant ──────────────────────────────────────────────────────────


def test_modern_registrant_has_null_legacy_total():
    """Modern filings with per-client compensation must write legacyTotalCompensation=None."""
    db, doc_ref = _make_db()
    detail = DisclosureDetail(
        compensation=[
            Compensation(client_name="Client A", amount=50_000.0),
            Compensation(client_name="Client B", amount=30_000.0),
        ],
        bills=[],
        legacy_total_compensation=None,
    )
    with patch("writer.firestore.ArrayUnion", side_effect=lambda x: x):
        write_registrant(db, _meta(), detail, "https://example.com/disc")

    data = _captured_data(doc_ref)
    assert data["legacyTotalCompensation"] is None
    assert len(data["clients"]) == 2
    assert data["clients"][0]["clientName"] == "Client A"
    assert data["clients"][1]["clientName"] == "Client B"


def test_legacy_registrant_writes_legacy_total():
    """Pre-2009 filings with no per-client breakdown must write legacyTotalCompensation."""
    db, doc_ref = _make_db()
    detail = DisclosureDetail(
        compensation=[],
        bills=[],
        legacy_total_compensation=112_500.0,
    )
    with patch("writer.firestore.ArrayUnion", side_effect=lambda x: x):
        write_registrant(db, _meta(year=2007), detail, "https://example.com/disc")

    data = _captured_data(doc_ref)
    assert data["legacyTotalCompensation"] == pytest.approx(112_500.0)
    assert data["clients"] == []


def test_clients_list_has_correct_fields():
    """Each client entry must carry clientName, clientNameNorm, and compensation."""
    db, doc_ref = _make_db()
    detail = DisclosureDetail(
        compensation=[Compensation(client_name="ML Strategies, LLC", amount=75_000.0)],
        bills=[],
    )
    with patch("writer.firestore.ArrayUnion", side_effect=lambda x: x):
        write_registrant(db, _meta(), detail, "https://example.com/disc")

    clients = _captured_data(doc_ref)["clients"]
    assert len(clients) == 1
    assert clients[0]["clientName"] == "ML Strategies, LLC"
    assert clients[0]["clientNameNorm"] == "ML STRATEGIES"
    assert clients[0]["compensation"] == 75_000.0


def test_registrant_skipped_when_entity_name_empty():
    """write_registrant must be a no-op when entity_name is empty."""
    db, doc_ref = _make_db()
    write_registrant(db, _meta(entity_name=""), DisclosureDetail(), "https://x.com")
    doc_ref.set.assert_not_called()


def test_registrant_skipped_when_year_none():
    """write_registrant must be a no-op when year is None."""
    db, doc_ref = _make_db()
    meta = DisclosureMeta(entity_name="Acme", year=None, reg_type="Employer")
    write_registrant(db, meta, DisclosureDetail(), "https://x.com")
    doc_ref.set.assert_not_called()


def test_write_registrant_includes_period_fields():
    """periodStart/periodEnd from DisclosureDetail must land on the written doc."""
    db, doc_ref = _make_db()
    detail = DisclosureDetail(
        compensation=[Compensation(client_name="Client A", amount=1000.0)],
        bills=[],
        period_start="2024-01-01",
        period_end="2024-06-30",
    )
    with patch("writer.firestore.ArrayUnion", side_effect=lambda x: x):
        write_registrant(db, _meta(), detail, "https://example.com/disc")

    data = _captured_data(doc_ref)
    assert data["periodStart"] == "2024-01-01"
    assert data["periodEnd"] == "2024-06-30"


def test_write_registrant_period_fields_none_when_unparsed():
    """A DisclosureDetail with no parsed period must write periodStart/periodEnd
    as None rather than omitting them or crashing."""
    db, doc_ref = _make_db()
    detail = DisclosureDetail(compensation=[], bills=[])
    with patch("writer.firestore.ArrayUnion", side_effect=lambda x: x):
        write_registrant(db, _meta(), detail, "https://example.com/disc")

    data = _captured_data(doc_ref)
    assert data["periodStart"] is None
    assert data["periodEnd"] is None


# ── registrant_id (the core bug fix) ────────────────────────────────────────


def test_registrant_id_differs_by_period():
    """Two different filing periods for the same entity+year must no longer
    collide onto the same Firestore doc id — this is the exact bug that
    caused a second period's write to silently overwrite the first's clients[]."""
    id_h1 = registrant_id("Acme Lobbying LLC", 2024, "2024-01-01")
    id_h2 = registrant_id("Acme Lobbying LLC", 2024, "2024-07-01")
    assert id_h1 != id_h2


def test_registrant_id_same_period_is_idempotent():
    """Re-processing the exact same period must produce the same id (safe,
    idempotent re-write), not a new doc each time."""
    a = registrant_id("Acme Lobbying LLC", 2024, "2024-01-01")
    b = registrant_id("Acme Lobbying LLC", 2024, "2024-01-01")
    assert a == b


def test_registrant_id_falls_back_without_period():
    """When period parsing fails (None), registrant_id must still produce a
    stable id rather than crash — malformed pages degrade gracefully."""
    a = registrant_id("Acme Lobbying LLC", 2024, None)
    b = registrant_id("Acme Lobbying LLC", 2024, None)
    assert a == b
    assert a != registrant_id("Acme Lobbying LLC", 2024, "2024-01-01")


def test_registrant_id_no_period_arg_matches_none():
    """Calling with the old 2-arg signature must match explicitly passing None,
    so any remaining 2-arg call sites keep working identically."""
    assert registrant_id("Acme Lobbying LLC", 2024) == registrant_id(
        "Acme Lobbying LLC", 2024, None
    )


def test_registrant_id_no_period_matches_pre_fix_hash_exactly():
    """Regression test for a real bug caught during the historical reparse:
    the no-period fallback must produce byte-for-byte the same hash as the
    original pre-period-aware scheme (hashlib.sha256(f"{year}|{entity_name}")),
    not merely "some stable id". An earlier version of this function added an
    unconditional trailing separator ("{year}|{entity_name}|") even when no
    period was known, which changed the hash and caused reparse to write a
    spurious duplicate doc instead of falling back onto the original one for
    any page whose reporting period failed to parse (found via two real
    2005-era entities in dev, Mayforth Group and Peter C Chisholm)."""
    import hashlib

    entity_name = "Mayforth Group, LLC"
    year = 2005
    pre_fix_id = hashlib.sha256(f"{year}|{entity_name}".encode()).hexdigest()[:40]
    assert registrant_id(entity_name, year, None) == pre_fix_id


# ── write_filings ─────────────────────────────────────────────────────────────


def test_write_filings_returns_count():
    """write_filings must return the number of documents written."""
    db = MagicMock()
    batch = MagicMock()
    db.batch.return_value = batch
    db.collection.return_value.document.return_value = MagicMock()

    detail = DisclosureDetail(
        compensation=[],
        bills=[
            BillActivity("Client A", "House Bill", "100", "H100", "An Act", "Support", None),
            BillActivity("Client A", "Senate Bill", "200", "S200", "An Act", "Oppose", None),
        ],
    )
    count = write_filings(db, _meta(), detail)
    assert count == 2
    assert batch.commit.called


def test_write_filings_returns_zero_when_no_bills():
    """write_filings must return 0 and not touch Firestore when bills list is empty."""
    db = MagicMock()
    detail = DisclosureDetail(compensation=[], bills=[])
    count = write_filings(db, _meta(), detail)
    assert count == 0
    db.batch.assert_not_called()


# ── compute_stats: not dropping data across split period docs ──────────────


def _fake_doc(data: dict) -> MagicMock:
    doc = MagicMock()
    doc.to_dict.return_value = data
    return doc


def _make_stats_db():
    """A MagicMock db where db.collection(STATS_COLLECTION).document(doc_id)
    returns a distinct, inspectable mock per doc_id (unlike the single shared
    mock _make_db() gives write_registrant's single-write callers)."""
    db = MagicMock()
    doc_mocks: dict[str, MagicMock] = {}

    def _document(doc_id):
        return doc_mocks.setdefault(doc_id, MagicMock())

    db.collection.return_value.document.side_effect = _document
    return db, doc_mocks


def test_compute_stats_registrant_count_deduped_across_periods():
    """Splitting one entity-year into two period docs (the fix's whole point)
    must not double-count totalRegistrants — it must count distinct
    (entity, year) registrations, not raw docs, since it's shown to users as
    the "Lobbying Firms" stat on the overview page."""
    db, doc_mocks = _make_stats_db()
    registrants = [
        _fake_doc({
            "entityNameNorm": "ACME LOBBYING",
            "year": 2024,
            "clients": [{"clientNameNorm": "CLIENT A", "compensation": 1000.0}],
        }),
        _fake_doc({
            "entityNameNorm": "ACME LOBBYING",
            "year": 2024,
            "clients": [{"clientNameNorm": "CLIENT A", "compensation": 2000.0}],
        }),
    ]

    def _iter(_db, collection_name):
        if collection_name == REGISTRANTS_COLLECTION:
            return iter(registrants)
        return iter([])

    with patch("writer._iter_collection", side_effect=_iter):
        compute_stats(db)

    stats = doc_mocks[STATS_DOC_ID].set.call_args[0][0]
    assert stats["totalRegistrants"] == 1, (
        "two period-docs for the same entity+year must count as one registrant"
    )
    # And compensation from both periods must both be reflected — the fix's
    # actual point, not just an inflation guard.
    assert stats["spendByYear"]["2024"] == pytest.approx(3000.0)


def test_compute_stats_registrant_count_not_deduped_across_different_entities():
    """Sanity check on the other direction: genuinely distinct entities must
    still be counted separately, not accidentally collapsed."""
    db, doc_mocks = _make_stats_db()
    registrants = [
        _fake_doc({"entityNameNorm": "ACME LOBBYING", "year": 2024, "clients": []}),
        _fake_doc({"entityNameNorm": "BETA LOBBYING", "year": 2024, "clients": []}),
    ]

    def _iter(_db, collection_name):
        if collection_name == REGISTRANTS_COLLECTION:
            return iter(registrants)
        return iter([])

    with patch("writer._iter_collection", side_effect=_iter):
        compute_stats(db)

    stats = doc_mocks[STATS_DOC_ID].set.call_args[0][0]
    assert stats["totalRegistrants"] == 2
