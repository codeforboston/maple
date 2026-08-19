"""Unit tests for Firestore document construction in writer.py.

Uses unittest.mock to intercept Firestore calls so no live database is needed.
"""

from __future__ import annotations

import sys
from pathlib import Path
from unittest.mock import MagicMock, patch, call

import pytest

sys.path.insert(0, str(Path(__file__).parent.parent))

from portal import BillActivity, Compensation, DisclosureDetail, DisclosureMeta
from writer import write_registrant, write_filings


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
