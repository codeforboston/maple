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
    filing_id,
    registrant_id,
)
from normalize import normalize_entity_name
from writer import (
    registrant_doc,
    registration_doc,
    remove_superseded_filings,
    write_registrant,
    write_filings,
    compute_stats,
    FILINGS_COLLECTION,
    REGISTRANTS_COLLECTION,
    REGISTRATIONS_COLLECTION,
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


def test_write_registrant_replaces_fields_but_keeps_disclosure_urls():
    """An amendment rewrites the registrant: each field is replaced whole,
    so a client it dropped leaves clientLobbyists, while disclosureUrls
    stays a union."""
    db, doc_ref = _make_db()
    detail = DisclosureDetail(client_lobbyists={"Client A": ["Jane Doe"]})
    with patch("writer.firestore.ArrayUnion", side_effect=lambda x: x):
        write_registrant(db, _meta(), detail, "https://example.com/disc")
    args, kwargs = doc_ref.set.call_args
    assert sorted(kwargs["merge"]) == sorted(args[0])
    assert {"clientLobbyists", "disclosureUrls"} <= set(kwargs["merge"])


def test_remove_superseded_filings_deletes_filings_of_each_version():
    db = MagicMock()
    query = db.collection.return_value.where.return_value
    query.stream.side_effect = [
        [MagicMock(reference=f"ref-{i}") for i in range(3)],
        [],
    ]
    batch = db.batch.return_value
    assert remove_superseded_filings(db, ["https://x/old-1", "https://x/old-2"]) == 3
    db.collection.assert_called_with(FILINGS_COLLECTION)
    filters = [c.kwargs["filter"] for c in db.collection.return_value.where.call_args_list]
    assert [f.value for f in filters] == ["https://x/old-1", "https://x/old-2"]
    assert all(f.field_path == "disclosureUrl" and f.op_string == "==" for f in filters)
    assert [c.args[0] for c in batch.delete.call_args_list] == ["ref-0", "ref-1", "ref-2"]
    assert batch.commit.call_count == 1


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
    any page whose reporting period failed to parse (found via two 2005-era
    entities in dev)."""
    import hashlib

    entity_name = "Pemberton Group, LLC"
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
    count = write_filings(db, _meta(), detail, "https://example.test/d")
    assert count == 2
    assert batch.commit.called


def test_write_filings_records_reporting_period():
    """Each filing records the reporting period of its disclosure."""
    db = MagicMock()
    batch = MagicMock()
    db.batch.return_value = batch
    detail = DisclosureDetail(
        compensation=[],
        bills=[BillActivity("Client A", "House Bill", "100", "H100", "An Act", "Support", None)],
        period_start="2025-07-01",
        period_end="2025-12-31",
    )
    write_filings(db, _meta(), detail, "https://example.test/d")
    doc = batch.set.call_args[0][1]
    assert doc["periodStart"] == "2025-07-01"
    assert doc["periodEnd"] == "2025-12-31"


def test_write_filings_returns_zero_when_no_bills():
    """write_filings must return 0 and not touch Firestore when bills list is empty."""
    db = MagicMock()
    detail = DisclosureDetail(compensation=[], bills=[])
    count = write_filings(db, _meta(), detail, "https://example.test/d")
    assert count == 0
    db.batch.assert_not_called()


def test_write_filings_uses_period_start_in_id():
    """write_filings must thread detail.period_start into filing_id, so two
    periods reporting the same bill+position no longer collide onto one doc
    (the filings analogue of the registrant_id collision bug)."""
    db = MagicMock()
    batch = MagicMock()
    db.batch.return_value = batch
    documented_ids = []
    db.collection.return_value.document.side_effect = lambda doc_id: documented_ids.append(doc_id) or MagicMock()

    bill = BillActivity("Client A", "House Bill", "100", "H100", "An Act", "Support", None)

    write_filings(
        db,
        _meta(),
        DisclosureDetail(compensation=[], bills=[bill], period_start="2024-01-01"),
        "https://example.test/h1",
    )
    write_filings(
        db,
        _meta(),
        DisclosureDetail(compensation=[], bills=[bill], period_start="2024-07-01"),
        "https://example.test/h2",
    )

    assert len(documented_ids) == 2
    assert documented_ids[0] != documented_ids[1]


# ── filing_id (the filings analogue of the registrant_id collision fix) ────


def test_filing_id_differs_by_period():
    """The same bill+client+chamber+position within one general court must no
    longer collide across reporting periods — previously this made the second
    period's write silently overwrite the first's filing doc (and its
    arbitrary, last-write-wins "year" field)."""
    id_h1 = filing_id("Acme Lobbying LLC", "Client A", "House Bill", "H100", 194, "Support", "2024-01-01")
    id_h2 = filing_id("Acme Lobbying LLC", "Client A", "House Bill", "H100", 194, "Support", "2024-07-01")
    assert id_h1 != id_h2


def test_filing_id_same_period_is_idempotent():
    a = filing_id("Acme Lobbying LLC", "Client A", "House Bill", "H100", 194, "Support", "2024-01-01")
    b = filing_id("Acme Lobbying LLC", "Client A", "House Bill", "H100", 194, "Support", "2024-01-01")
    assert a == b


def test_filing_id_falls_back_without_period():
    a = filing_id("Acme Lobbying LLC", "Client A", "House Bill", "H100", 194, "Support", None)
    b = filing_id("Acme Lobbying LLC", "Client A", "House Bill", "H100", 194, "Support", None)
    assert a == b
    assert a != filing_id("Acme Lobbying LLC", "Client A", "House Bill", "H100", 194, "Support", "2024-01-01")


def test_filing_id_no_period_arg_matches_none():
    """Calling with the old 6-arg signature must match explicitly passing
    period_start=None, so the one existing call site keeps working identically
    whenever a period fails to parse."""
    assert filing_id("Acme Lobbying LLC", "Client A", "House Bill", "H100", 194, "Support") == filing_id(
        "Acme Lobbying LLC", "Client A", "House Bill", "H100", 194, "Support", None
    )


def test_filing_id_no_period_matches_pre_fix_hash_exactly():
    """The no-period fallback must produce byte-for-byte the same hash as the
    original pre-period-aware scheme, so a page whose period fails to parse
    still falls onto whatever doc a prior run already wrote instead of
    spawning a spurious duplicate."""
    import hashlib

    key = "|".join(["Acme Lobbying LLC", "Client A", "House Bill", "H100", "194", "Support"])
    pre_fix_id = hashlib.sha256(key.encode()).hexdigest()[:40]
    assert filing_id("Acme Lobbying LLC", "Client A", "House Bill", "H100", 194, "Support", None) == pre_fix_id


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


def _stats_iter(registrants=(), registrations=(), filings=()):
    def _iter(_db, collection_name):
        if collection_name == REGISTRANTS_COLLECTION:
            return iter(registrants)
        if collection_name == REGISTRATIONS_COLLECTION:
            return iter(registrations)
        if collection_name == FILINGS_COLLECTION:
            return iter(filings)
        return iter([])
    return _iter


def test_compute_stats_lobbyist_count_is_distinct_registered_individuals():
    """totalRegistrants is shown as "Individual lobbyists": each registered
    person once, across years, whether or not they file disclosures."""
    db, doc_mocks = _make_stats_db()
    registrations = [
        _fake_doc({"name": "Jane Doe", "nameNorm": "JANE DOE", "regType": "Lobbyist", "year": 2024}),
        _fake_doc({"name": "Jane Doe", "nameNorm": "JANE DOE", "regType": "Lobbyist", "year": 2025}),
        _fake_doc({"name": "John Roe", "nameNorm": "JOHN ROE", "regType": "Lobbyist", "year": 2025}),
        _fake_doc({"name": "Acme Lobbying", "nameNorm": "ACME LOBBYING", "regType": "Employer", "year": 2025}),
    ]
    registrants = [_fake_doc({
        "entityNameNorm": "JANE DOE", "regType": "Lobbyist", "year": 2024,
        "clients": [{"clientNameNorm": "CLIENT A", "compensation": 1000.0}],
    })]

    with patch("writer._iter_collection", side_effect=_stats_iter(registrants, registrations)):
        compute_stats(db)

    stats = doc_mocks[STATS_DOC_ID].set.call_args[0][0]
    assert stats["totalRegistrants"] == 2
    assert stats["spendByYear"]["2024"] == pytest.approx(1000.0)


def test_compute_stats_lists_lobbyists_who_only_register():
    """A lobbyist whose firm files for them has no disclosures of their own,
    but must still be listed, with their firm and SoS registration page."""
    db, _ = _make_stats_db()
    registrations = [
        _fake_doc({"name": "Jordan Ellery", "nameNorm": "JORDAN ELLERY", "regType": "Lobbyist", "year": 2024,
                   "sourceUrls": ["https://sos.test/2024"],
                   "employers": [{"name": "Barlow, Finch & Kerr"}]}),
        _fake_doc({"name": "Jordan Ellery", "nameNorm": "JORDAN ELLERY", "regType": "Lobbyist", "year": 2025,
                   "sourceUrls": ["https://sos.test/2025"],
                   "employers": [{"name": "Barlow, Finch & Kerr"}]}),
    ]

    with patch("writer._iter_collection", side_effect=_stats_iter(registrations=registrations)):
        compute_stats(db)

    firms = {d["entityNameNorm"]: d for d in _batch_set_dicts_with_key(db, "clientCount")}
    basile = firms["JORDAN ELLERY"]
    assert basile["regType"] == "Lobbyist"
    assert basile["years"] == [2025, 2024]
    assert basile["employers"] == ["Barlow, Finch & Kerr"]
    assert basile["hasFilings"] is False
    assert basile["sourceUrl"] == "https://sos.test/2025"


def _batch_set_dicts_with_key(db: MagicMock, key: str) -> list[dict]:
    """Every dict passed to batch.set(ref, doc) across all of compute_stats'
    batched writes (bills, then clients, then firms all share one mocked
    db.batch() return value) that contains the given key — used to pull out
    just the client- or firm-summary docs without needing a fully faithful
    collection/subcollection mock."""
    return [
        call[0][1]
        for call in db.batch.return_value.set.call_args_list
        if isinstance(call[0][1], dict) and key in call[0][1]
    ]


def test_compute_stats_firm_summary_client_count_deduped_across_periods():
    """New in this merge: firm_summaries[...]['clientCount'] (labeled
    "Clients represented" on /lobbying/firms) must count distinct clients,
    not double-count because the same firm+year now spans two period docs."""
    db, _ = _make_stats_db()
    registrants = [
        _fake_doc({
            "entityName": "Acme Lobbying",
            "entityNameNorm": "ACME LOBBYING",
            "regType": "Employer",
            "year": 2024,
            "clients": [
                {"clientNameNorm": "CLIENT A", "clientName": "Client A", "compensation": 1000.0}
            ],
        }),
        _fake_doc({
            "entityName": "Acme Lobbying",
            "entityNameNorm": "ACME LOBBYING",
            "regType": "Employer",
            "year": 2024,
            "clients": [
                {"clientNameNorm": "CLIENT A", "clientName": "Client A", "compensation": 2000.0}
            ],
        }),
    ]

    def _iter(_db, collection_name):
        if collection_name == REGISTRANTS_COLLECTION:
            return iter(registrants)
        return iter([])

    with patch("writer._iter_collection", side_effect=_iter):
        compute_stats(db)

    firm_docs = _batch_set_dicts_with_key(db, "clientCount")
    assert len(firm_docs) == 1
    assert firm_docs[0]["clientCount"] == 1


def test_compute_stats_client_summary_registrant_count_deduped_across_periods():
    """New in this merge: client_summaries[...]['registrantCount'] (labeled
    "Lobbyists" on /lobbying/clients) must count distinct firms, not
    double-count because the same firm+year now spans two period docs."""
    db, _ = _make_stats_db()
    registrants = [
        _fake_doc({
            "entityName": "Acme Lobbying",
            "entityNameNorm": "ACME LOBBYING",
            "regType": "Employer",
            "year": 2024,
            "clients": [
                {"clientNameNorm": "CLIENT A", "clientName": "Client A", "compensation": 1000.0}
            ],
        }),
        _fake_doc({
            "entityName": "Acme Lobbying",
            "entityNameNorm": "ACME LOBBYING",
            "regType": "Employer",
            "year": 2024,
            "clients": [
                {"clientNameNorm": "CLIENT A", "clientName": "Client A", "compensation": 2000.0}
            ],
        }),
    ]

    def _iter(_db, collection_name):
        if collection_name == REGISTRANTS_COLLECTION:
            return iter(registrants)
        return iter([])

    with patch("writer._iter_collection", side_effect=_iter):
        compute_stats(db)

    client_docs = _batch_set_dicts_with_key(db, "registrantCount")
    assert len(client_docs) == 1
    assert client_docs[0]["registrantCount"] == 1


# ── Attribution: firm disclosures are credited to the firm ──────────────────


def _firm_detail():
    return DisclosureDetail(
        compensation=[Compensation(client_name="Client A", amount=1000.0)],
        bills=[BillActivity("Client A", "House Bill", "100", "H100", "An Act", "Support", None)],
        period_start="2025-01-01",
        period_end="2025-06-30",
        filer_type="Employer",
        filer_name="Larkspur Strategies Group LLC",
        lobbyists=["Riley Okafor", "Morgan Tate"],
    )


def test_registrant_doc_credits_firm_page_to_firm():
    lobbyist_meta = _meta(entity_name="Riley Okafor", year=2025, reg_type="Lobbyist")
    doc_id, data = registrant_doc(lobbyist_meta, _firm_detail())
    assert data["entityName"] == "Larkspur Strategies Group LLC"
    assert data["regType"] == "Employer"
    assert data["lobbyists"] == ["Riley Okafor", "Morgan Tate"]
    assert data["lobbyistsNorm"] == [normalize_entity_name("Riley Okafor"), normalize_entity_name("Morgan Tate")]
    assert doc_id == registrant_id("Larkspur Strategies Group LLC", 2025, "2025-01-01")


def test_registrant_doc_same_for_any_linking_summary():
    """Reached via the firm's summary or any lobbyist's, the page must map to
    one registrant doc — the root cause of dev/prod attribution drift."""
    detail = _firm_detail()
    ids = {
        registrant_doc(_meta(entity_name=n, year=2025, reg_type=t), detail)[0]
        for n, t in [("Riley Okafor", "Lobbyist"), ("Morgan Tate", "Lobbyist"),
                     ("Larkspur Strategies Group LLC", "Employer")]
    }
    assert len(ids) == 1


def test_registrant_doc_individual_page_unchanged():
    detail = DisclosureDetail(compensation=[], bills=[], period_start="2025-01-01",
                              filer_type="Lobbyist")
    _, data = registrant_doc(_meta(entity_name="Taylor Brooke Vance", reg_type="Lobbyist"), detail)
    assert data["entityName"] == "Taylor Brooke Vance"
    assert data["regType"] == "Lobbyist"
    assert data["lobbyists"] == []


def test_write_filings_credits_firm_page_to_firm():
    db = MagicMock()
    db.batch.return_value = MagicMock()
    written = []
    db.collection.return_value.document.side_effect = lambda doc_id: MagicMock(id=doc_id)
    db.batch.return_value.set.side_effect = lambda ref, doc: written.append((ref.id, doc))

    detail = _firm_detail()
    write_filings(db, _meta(entity_name="Riley Okafor", year=2025, reg_type="Lobbyist"), detail,
                  "https://example.test/tremont")

    (fid, doc), = written
    assert doc["entityName"] == "Larkspur Strategies Group LLC"
    assert doc["disclosureUrl"] == "https://example.test/tremont"
    assert doc["periodEnd"] == "2025-06-30"
    bill = detail.bills[0]
    assert fid == filing_id("Larkspur Strategies Group LLC", bill.client_name, bill.chamber,
                            bill.bill_id, 194, bill.position, "2025-01-01")


def test_compute_stats_firm_summary_lists_lobbyists_across_periods():
    """Firm summaries carry the union of lobbyists named in the firm's
    disclosures, so the firms list can find a firm by a lobbyist's name."""
    db, _ = _make_stats_db()
    base = {"entityName": "Larkspur Strategies Group LLC", "entityNameNorm": "LARKSPUR STRATEGIES GROUP",
            "regType": "Employer", "year": 2025, "clients": []}
    registrants = [
        _fake_doc({**base, "lobbyists": ["Morgan Tate", "Riley Okafor"]}),
        _fake_doc({**base, "lobbyists": ["Riley Okafor", "Casey Lindqvist"]}),
        _fake_doc({"entityName": "Solo Person", "entityNameNorm": "SOLO PERSON",
                   "regType": "Lobbyist", "year": 2025, "clients": []}),
    ]

    def _iter(_db, collection_name):
        return iter(registrants if collection_name == REGISTRANTS_COLLECTION else [])

    with patch("writer._iter_collection", side_effect=_iter):
        compute_stats(db)

    firms = {d["entityNameNorm"]: d for d in _batch_set_dicts_with_key(db, "clientCount")}
    assert firms["LARKSPUR STRATEGIES GROUP"]["lobbyists"] == ["Casey Lindqvist", "Morgan Tate", "Riley Okafor"]
    assert firms["SOLO PERSON"]["lobbyists"] == []


def test_compute_stats_prunes_stale_firm_summaries():
    """A firm summary left from an earlier run (e.g. a lobbyist whose
    records are now credited to their firm) must be removed, or it keeps
    appearing in the firms list and search."""
    db, doc_mocks = _make_stats_db()
    registrants = [_fake_doc({"entityName": "Acme", "entityNameNorm": "ACME",
                              "regType": "Employer", "year": 2025, "clients": []})]

    def _iter(_db, collection_name):
        return iter(registrants if collection_name == REGISTRANTS_COLLECTION else [])

    keep_ref, stale_ref = MagicMock(id="ACME"), MagicMock(id="CHET%20ATKINS")
    doc_mocks["firmSummaries"] = MagicMock()
    doc_mocks["firmSummaries"].collection.return_value.list_documents.return_value = [keep_ref, stale_ref]

    with patch("writer._iter_collection", side_effect=_iter):
        compute_stats(db)

    deleted = [c[0][0] for c in db.batch.return_value.delete.call_args_list]
    assert stale_ref in deleted
    assert keep_ref not in deleted


def test_compute_stats_overwrites_stats_doc():
    """The stats doc must be fully replaced: a merge keeps spendByYear years
    this run no longer produces (it left stale 2005-2009 figures in dev)."""
    db, doc_mocks = _make_stats_db()
    with patch("writer._iter_collection", side_effect=lambda _db, _name: iter([])):
        compute_stats(db)
    call = doc_mocks[STATS_DOC_ID].set.call_args
    assert not call[1].get("merge"), "stats doc must not be written with merge"


def test_registration_doc_shape_and_id():
    from portal import Registration, RegistrationParty
    reg = Registration(
        url="https://sos.test/a", name="Jordan Ellery", year=2024, reg_type="Lobbyist",
        employers=[RegistrationParty(name="Barlow, Finch & Kerr", url="https://sos.test/scc",
                                     amount=100.0, start_date="2024-01-01")],
        disclosure_urls=["https://sos.test/d1"],
    )
    doc_id, data = registration_doc(reg)
    assert data["nameNorm"] == "JORDAN ELLERY"
    assert data["employers"][0]["nameNorm"] == "BARLOW FINCH AND KERR"
    assert data["employers"][0]["sourceUrl"] == "https://sos.test/scc"
    assert data["disclosureUrls"] == ["https://sos.test/d1"]
    # A duplicate page (another URL, same registrant and year) is the same doc.
    dup = Registration(url="https://sos.test/b", name="Jordan Ellery", year=2024, reg_type="Lobbyist")
    assert registration_doc(dup)[0] == doc_id


def test_compute_stats_rolls_up_registrations_for_profiles():
    db, _ = _make_stats_db()
    registrations = [
        _fake_doc({"name": "Jordan Ellery", "nameNorm": "JORDAN ELLERY", "regType": "Lobbyist", "year": 2024,
                   "sourceUrls": ["https://sos.test/cb24"],
                   "employers": [{"name": "Barlow, Finch & Kerr", "nameNorm": "BARLOW FINCH AND KERR"}]}),
        _fake_doc({"name": "Barlow, Finch & Kerr", "nameNorm": "BARLOW FINCH AND KERR",
                   "regType": "Employer", "year": 2024, "sourceUrls": ["https://sos.test/scc24"],
                   "lobbyists": [{"name": "Jordan Ellery", "nameNorm": "JORDAN ELLERY"},
                                 {"name": "Pat Unregistered", "nameNorm": "PAT UNREGISTERED"}]}),
    ]
    with patch("writer._iter_collection", side_effect=_stats_iter(registrations=registrations)):
        compute_stats(db)

    firms = {d["entityNameNorm"]: d for d in _batch_set_dicts_with_key(db, "clientCount")}
    (basile_reg,) = firms["JORDAN ELLERY"]["registrations"]
    assert basile_reg["year"] == 2024 and basile_reg["sourceUrl"] == "https://sos.test/cb24"
    assert basile_reg["employers"] == [
        {"name": "Barlow, Finch & Kerr", "nameNorm": "BARLOW FINCH AND KERR", "hasProfile": True}
    ]
    (scc_reg,) = firms["BARLOW FINCH AND KERR"]["registrations"]
    assert [(p["name"], p["hasProfile"]) for p in scc_reg["lobbyists"]] == [
        ("Jordan Ellery", True), ("Pat Unregistered", False)
    ]


def test_compute_stats_employer_listed_once_across_spellings():
    """An employer spelled differently across years is one employer, shown
    with its most recent spelling."""
    db, _ = _make_stats_db()
    registrations = [
        _fake_doc({"name": "Jordan Ellery", "nameNorm": "JORDAN ELLERY", "regType": "Lobbyist", "year": year,
                   "employers": [{"name": spelling, "nameNorm": "BARLOW FINCH AND KERR"}]})
        for year, spelling in [(2020, "Barlow Finch & Kerr"), (2023, "Barlow, Finch & Kerr Public Policy Group, LLC")]
    ]
    with patch("writer._iter_collection", side_effect=_stats_iter(registrations=registrations)):
        compute_stats(db)
    firms = {d["entityNameNorm"]: d for d in _batch_set_dicts_with_key(db, "clientCount")}
    assert firms["JORDAN ELLERY"]["employers"] == ["Barlow, Finch & Kerr Public Policy Group, LLC"]


def test_compute_stats_per_session_counts_for_list_filters():
    """Lobbyist and client summaries carry per-session (general court) counts
    so the lists can be filtered by session with exact numbers."""
    db, _ = _make_stats_db()
    registrants = [
        _fake_doc({"entityName": "Larkspur Strategies Group LLC", "entityNameNorm": "LARKSPUR STRATEGIES GROUP",
                   "regType": "Employer", "year": 2023,          # session 193
                   "clients": [{"clientName": "Client A", "clientNameNorm": "CLIENT A", "compensation": 1000.0},
                               {"clientName": "Client B", "clientNameNorm": "CLIENT B", "compensation": 500.0}]}),
        _fake_doc({"entityName": "Larkspur Strategies Group LLC", "entityNameNorm": "LARKSPUR STRATEGIES GROUP",
                   "regType": "Employer", "year": 2025,          # session 194
                   "clients": [{"clientName": "Client A", "clientNameNorm": "CLIENT A", "compensation": 2000.0}]}),
    ]
    filings = [
        _fake_doc({"entityNameNorm": "LARKSPUR STRATEGIES GROUP", "clientNameNorm": "CLIENT A", "generalCourt": 193, "year": 2023}),
        _fake_doc({"entityNameNorm": "LARKSPUR STRATEGIES GROUP", "clientNameNorm": "CLIENT A", "generalCourt": 194, "year": 2025}),
        _fake_doc({"entityNameNorm": "LARKSPUR STRATEGIES GROUP", "clientNameNorm": "CLIENT A", "generalCourt": 194, "year": 2025}),
    ]

    def _iter(_db, collection_name):
        if collection_name == REGISTRANTS_COLLECTION:
            return iter(registrants)
        if collection_name == "lobbyingFilings":
            return iter(filings)
        return iter([])

    with patch("writer._iter_collection", side_effect=_iter):
        compute_stats(db)

    firm = {d["entityNameNorm"]: d for d in _batch_set_dicts_with_key(db, "clientCount")}["LARKSPUR STRATEGIES GROUP"]
    assert firm["courts"] == {"193": {"filings": 1, "clientCount": 2}, "194": {"filings": 2, "clientCount": 1}}
    client = {d["clientNameNorm"]: d for d in _batch_set_dicts_with_key(db, "registrantCount")}["CLIENT A"]
    others = {"bills": 0, "inHouseCount": 0, "individuals": 0, "firmAgents": 0,
              "inHouseLobbyists": 0, "hiredFirms": 1, "firmsWithoutAgents": 1, "inHouseFilers": []}
    assert client["courts"] == {
        "193": {"filings": 1, "lobbyistCount": 1, "compensation": 1000.0, **others},
        "194": {"filings": 2, "lobbyistCount": 1, "compensation": 2000.0, **others},
    }


# ── compute_stats: aggregates for the Lobbying Explorer redesign ────────────


def _filing(entity, client, bill_id="H100", position="Support", court=194, year=2025, **extra):
    return _fake_doc({"entityNameNorm": entity, "clientNameNorm": client, "clientName": client,
                      "billId": bill_id, "position": position, "generalCourt": court,
                      "year": year, **extra})


def _registrant(entity, year, reg_type="Employer", clients=(), **extra):
    return _fake_doc({"entityName": entity, "entityNameNorm": entity, "regType": reg_type,
                      "year": year, "clients": [
                          {"clientName": c, "clientNameNorm": c, "compensation": comp}
                          for c, comp in clients], **extra})


def _registration(name, year, reg_type="Lobbyist", **extra):
    return _fake_doc({"name": name, "nameNorm": name, "regType": reg_type, "year": year, **extra})


def _run_stats(**collections):
    db, doc_mocks = _make_stats_db()
    with patch("writer._iter_collection", side_effect=_stats_iter(**collections)):
        compute_stats(db)
    clients = {d["clientNameNorm"]: d for d in _batch_set_dicts_with_key(db, "registrantCount")}
    return db, doc_mocks, clients


def _stats_doc(doc_mocks) -> dict:
    return doc_mocks[STATS_DOC_ID].set.call_args[0][0]


def test_compute_stats_counts_distinct_bills_per_client_session():
    """G1: a client's bills are distinct bill ids, not its filings."""
    filings = [_filing("FIRM", "CLIENT A", "H100"), _filing("FIRM", "CLIENT A", "H100", "Oppose"),
               _filing("FIRM", "CLIENT A", "H200")]
    _, _, clients = _run_stats(registrants=[_registrant("FIRM", 2025, clients=[("CLIENT A", 10.0)])],
                               filings=filings)
    assert clients["CLIENT A"]["courts"]["194"]["bills"] == 2


def test_compute_stats_counts_organizations_per_position():
    """G2: an organization counts once per position it reported, however many
    filings, and in both when it reported two positions."""
    filings = [_filing("FIRM 1", "ORG A", "H100", "Support"), _filing("FIRM 2", "ORG A", "H100", "Support"),
               _filing("FIRM 1", "ORG A", "H100", "Oppose"), _filing("FIRM 1", "ORG B", "H100", "Neutral")]
    db, _, _ = _run_stats(filings=filings)
    (bill,) = _batch_set_dicts_with_key(db, "orgSupport")
    assert (bill["orgSupport"], bill["orgOppose"], bill["orgNeutral"]) == (1, 1, 1)
    assert bill["support"] == 2 and bill["clients"] == 2


def test_compute_stats_session_lobbyists_are_registered_and_active():
    """G3: a session's lobbyists and firms are those registered in it and on a
    disclosure in it, as filer or named by a firm; all-time totals count each
    once across sessions."""
    registrations = [
        _registration("FILES OWN", 2025), _registration("NAMED BY FIRM", 2025),
        _registration("NEVER ACTIVE", 2025), _registration("FIRM", 2023, "Employer"),
        _registration("FIRM", 2025, "Employer"), _registration("FILES OWN", 2023),
    ]
    registrants = [
        _registrant("FILES OWN", 2025, "Lobbyist"), _registrant("FILES OWN", 2023, "Lobbyist"),
        _registrant("FIRM", 2025, lobbyistsNorm=["NAMED BY FIRM"]), _registrant("FIRM", 2023),
    ]
    _, doc_mocks, _ = _run_stats(registrants=registrants, registrations=registrations)
    stats = _stats_doc(doc_mocks)
    assert (stats["courts"]["194"]["lobbyists"], stats["courts"]["194"]["firms"]) == (2, 1)
    assert (stats["courts"]["193"]["lobbyists"], stats["courts"]["193"]["firms"]) == (1, 1)
    assert (stats["totalLobbyists"], stats["totalEntities"]) == (2, 1)


def test_compute_stats_session_key_figures():
    """G4: a session's bills and clients are distinct, and paid sums only
    that session's years of registrant compensation."""
    filings = [_filing("FIRM", "CLIENT A", "H100"), _filing("FIRM", "CLIENT B", "H100"),
               _filing("FIRM", "CLIENT A", "H200", year=2026),
               _filing("FIRM", "CLIENT C", "H100", court=193, year=2023)]
    registrants = [_registrant("FIRM", 2025, clients=[("CLIENT A", 100.0)]),
                   _registrant("FIRM", 2026, clients=[("CLIENT B", 50.0)]),
                   _registrant("FIRM", 2023, clients=[("CLIENT C", 7.0)])]
    _, doc_mocks, _ = _run_stats(registrants=registrants, filings=filings)
    court = _stats_doc(doc_mocks)["courts"]["194"]
    assert (court["bills"], court["clients"], court["paid"]) == (2, 2, 150.0)


def test_compute_stats_classifies_in_house_filers():
    """G5: a filer is in-house when that session's registration names the
    client as its employer, or when the filer is the client. Registrations
    before 2019 name no employers, so a firm there is never in-house."""
    filings = [
        _filing("STAFFER", "CLIENT A"),                      # employed by the client
        _filing("HIRED FIRM", "CLIENT A"),                   # hired
        _filing("CLIENT A", "CLIENT A"),                     # files for itself
        _filing("STAFFER", "CLIENT A", court=193, year=2023),
        _filing("OLD FIRM", "OLD CLIENT", court=189, year=2015),
    ]
    registrations = [
        _registration("STAFFER", 2025, employers=[{"name": "Client A", "nameNorm": "CLIENT A"}]),
        _registration("STAFFER", 2023, employers=[{"name": "Client A", "nameNorm": "CLIENT A"}]),
    ]
    registrants = [_registrant("HIRED FIRM", 2025, clients=[("CLIENT A", 1.0)]),
                   _registrant("OLD FIRM", 2015, clients=[("OLD CLIENT", 1.0)])]
    _, doc_mocks, clients = _run_stats(registrants=registrants, registrations=registrations,
                                       filings=filings)
    assert clients["CLIENT A"]["courts"]["194"]["inHouseCount"] == 2
    assert clients["CLIENT A"]["courts"]["193"]["inHouseCount"] == 1
    assert clients["CLIENT A"]["inHouseCount"] == 2  # STAFFER once across sessions
    assert clients["OLD CLIENT"]["inHouseCount"] == 0
    assert doc_mocks["inHouseFilers_194"].set.call_args[0][0] == {"CLIENT A": ["CLIENT A", "STAFFER"]}
    # No in-house clients in the 189th: its doc is removed, not written.
    assert not doc_mocks["inHouseFilers_189"].set.called
    doc_mocks["inHouseFilers_189"].delete.assert_called_once()


def test_compute_stats_counts_individual_lobbyists_per_client():
    """The clients list counts people: in-house individuals plus the agents a
    firm names on the client's account, each once."""
    registrants = [
        _registrant("STAFFER", 2025, "Lobbyist", clients=[("CLIENT A", 1.0)]),
        _registrant("HIRED FIRM", 2025, clients=[("CLIENT A", 1.0)],
                    clientLobbyists={"CLIENT A": ["Agent One", "Agent Two", "Staffer"]}),
        _registrant("HIRED FIRM", 2023, clients=[("CLIENT A", 1.0)],
                    clientLobbyists={"CLIENT A": ["Agent One"]}),
    ]
    registrations = [_registration("STAFFER", 2025, employers=[{"name": "Client A", "nameNorm": "CLIENT A"}])]
    filings = [_filing("STAFFER", "CLIENT A"), _filing("HIRED FIRM", "CLIENT A")]
    _, _, clients = _run_stats(registrants=registrants, registrations=registrations, filings=filings)
    court = clients["CLIENT A"]["courts"]["194"]
    # STAFFER is in-house; the firm's agents are hired, and STAFFER isn't counted twice.
    assert (court["individuals"], court["firmAgents"]) == (3, 2)
    assert clients["CLIENT A"]["courts"]["193"]["individuals"] == 1
    assert clients["CLIENT A"]["individuals"] == 3


def test_compute_stats_client_registration_dates_and_link():
    """G6: first registered is the earliest employment start; the link and
    last year come from the latest registration listing the client, never
    from disclosure years."""
    registrations = [
        _registration("FIRM", 2012, "Employer", sourceUrls=["https://sos.test/2012"],
                      clients=[{"name": "Client A", "nameNorm": "CLIENT A", "startDate": "2012-03-01"}]),
        _registration("FIRM", 2024, "Employer", sourceUrls=["https://sos.test/2024"],
                      clients=[{"name": "Client A", "nameNorm": "CLIENT A", "startDate": "2024-01-01"}]),
    ]
    registrants = [_registrant("FIRM", 2026, clients=[("CLIENT A", 1.0), ("CLIENT B", 1.0)])]
    _, _, clients = _run_stats(registrants=registrants, registrations=registrations)
    a = clients["CLIENT A"]
    assert (a["firstRegistered"], a["lastRegisteredYear"], a["registrationUrl"]) == (
        "2012-03-01", 2024, "https://sos.test/2024")
    b = clients["CLIENT B"]
    assert (b["firstRegistered"], b["lastRegisteredYear"], b["registrationUrl"]) == (None, None, None)


def test_compute_stats_links_the_clients_own_registration_page():
    """The link is the client's own page from the latest year a registration
    links it, and falls back to the latest registration listing the client
    when none links it."""
    def client(norm, page=None):
        return {"name": norm.title(), "nameNorm": norm, "sourceUrl": page}
    registrations = [
        _registration("STAFF ONE", 2024, sourceUrls=["https://sos.test/staff-one-2024"],
                      clients=[client("CLIENT A", "https://sos.test/client-a-2024")]),
        _registration("STAFF ONE", 2025, sourceUrls=["https://sos.test/staff-one-2025"],
                      clients=[client("CLIENT A", "https://sos.test/client-a-2025")]),
        _registration("STAFF TWO", 2025, sourceUrls=["https://sos.test/staff-two-2025"],
                      clients=[client("CLIENT A", "https://sos.test/client-a-2025")]),
        # A later registration with no client link doesn't replace the page.
        _registration("STAFF THREE", 2026, sourceUrls=["https://sos.test/staff-three-2026"],
                      clients=[client("CLIENT A")]),
        _registration("FIRM", 2024, "Employer", sourceUrls=["https://sos.test/firm-2024"],
                      clients=[client("CLIENT B")]),
    ]
    registrants = [_registrant("FIRM", 2025, clients=[("CLIENT A", 1.0), ("CLIENT B", 1.0)])]
    _, _, clients = _run_stats(registrants=registrants, registrations=registrations)
    a = clients["CLIENT A"]
    assert (a["registrationUrl"], a["lastRegisteredYear"]) == ("https://sos.test/client-a-2025", 2026)
    assert clients["CLIENT B"]["registrationUrl"] == "https://sos.test/firm-2024"


def test_registrant_doc_lists_agents_per_client():
    detail = DisclosureDetail(compensation=[Compensation("The Client, Inc.", 1.0)], bills=[],
                              period_start="2025-01-01", client_lobbyists={
                                  "The Client, Inc.": ["Riley Okafor"], "THE CLIENT": ["Morgan Tate"]})
    _, data = registrant_doc(_meta(year=2025), detail)
    assert data["clientLobbyists"] == {normalize_entity_name("The Client, Inc."): ["Riley Okafor", "Morgan Tate"]}



def test_compute_stats_staff_registered_with_their_organization_as_client_are_in_house():
    """Staff of an organization that doesn't register as an entity register
    as individuals with no employer, listing the organization as their one
    client (e.g. the Greater Boston Chamber of Commerce's lobbyists). That
    holds before 2019 too. A lobbyist registered under a firm lists no
    clients and stays hired."""
    chamber = [{"name": "The Chamber", "nameNorm": "CHAMBER"}]
    registrations = [
        _registration("STAFFER", 2025, clients=chamber),
        _registration("OLD STAFFER", 2015, clients=chamber),
        _registration("FIRM AGENT", 2025, employers=[{"name": "Firm", "nameNorm": "FIRM"}]),
    ]
    filings = [_filing("STAFFER", "CHAMBER"), _filing("FIRM AGENT", "CHAMBER"),
               _filing("OLD STAFFER", "CHAMBER", court=189, year=2015)]
    registrants = [_registrant("STAFFER", 2025, "Lobbyist", clients=[("CHAMBER", 1.0)])]
    _, doc_mocks, clients = _run_stats(registrants=registrants, registrations=registrations,
                                       filings=filings)
    assert clients["CHAMBER"]["courts"]["194"]["inHouseCount"] == 1
    assert clients["CHAMBER"]["courts"]["189"]["inHouseCount"] == 1
    assert doc_mocks["inHouseFilers_194"].set.call_args[0][0] == {"CHAMBER": ["STAFFER"]}
    assert doc_mocks["inHouseFilers_189"].set.call_args[0][0] == {"CHAMBER": ["OLD STAFFER"]}


def test_compute_stats_counts_in_house_and_hired_lobbyists_per_client():
    """Every lobbyist or entity working for a client in a session is either
    its own staff or hired, counted from one set so the two add up; a hired
    individual counts as a one-person firm (and as its own agent)."""
    other_firm = [{"name": "Other Firm", "nameNorm": "OTHER FIRM"}]
    client = [{"name": "Client A", "nameNorm": "CLIENT A"}]
    registrations = [
        _registration("STAFFER", 2025, clients=client),               # in-house
        _registration("INDIE", 2025, employers=other_firm),           # hired individual
        _registration("SWITCHER", 2023, clients=client),              # in-house in the 193rd...
        _registration("SWITCHER", 2025, employers=other_firm),        # ...hired in the 194th
    ]
    registrants = [
        _registrant("FIRM 1", 2025, clients=[("CLIENT A", 1.0)]),
        _registrant("FIRM 2", 2025, clients=[("CLIENT A", 1.0)]),
        _registrant("FIRM 1", 2023, clients=[("CLIENT A", 1.0)]),
    ]
    filings = [
        _filing("STAFFER", "CLIENT A"), _filing("CLIENT A", "CLIENT A"),  # the client files for itself
        _filing("INDIE", "CLIENT A"), _filing("SWITCHER", "CLIENT A"),
        _filing("SWITCHER", "CLIENT A", court=193, year=2023),
    ]
    _, _, clients = _run_stats(registrants=registrants, registrations=registrations, filings=filings)
    a = clients["CLIENT A"]
    s194, s193 = a["courts"]["194"], a["courts"]["193"]
    # 194th: staff and the client itself vs two firms, the independent and the switcher.
    assert (s194["inHouseLobbyists"], s194["hiredFirms"]) == (2, 4)
    assert s194["firmAgents"] == 2  # the two hired individuals, each its own agent
    assert (s193["inHouseLobbyists"], s193["hiredFirms"]) == (1, 1)
    # All time: in-house anywhere wins, so SWITCHER counts once, as in-house.
    assert (a["inHouseLobbyists"], a["hiredFirms"]) == (3, 3)


def test_compute_stats_counts_bills_numbered_1_to_9_but_not_0():
    """H1-H9 and S1-S9 are bills (H1 is the House budget); filers enter
    bill 0 for activity on no bill yet, so H0/S0 aren't."""
    filings = [_filing("FIRM", "CLIENT A", b) for b in ("H1", "S9", "H123", "H0", "S0")]
    filings.append(_filing("FIRM", "CLIENT A", None))
    db, doc_mocks, clients = _run_stats(registrants=[_registrant("FIRM", 2025, clients=[("CLIENT A", 1.0)])],
                                        filings=filings)
    assert clients["CLIENT A"]["courts"]["194"]["bills"] == 3
    assert _stats_doc(doc_mocks)["courts"]["194"]["bills"] == 3
    assert len(_batch_set_dicts_with_key(db, "orgSupport")) == 3  # one summary per bill


def test_compute_stats_lists_no_client_but_counts_no_organization():
    """The portal's "No client" (a period with no client) isn't an
    organization: it gets a summary and list rows, marked placeholder, listing
    the lobbyists who reported it, but no client, organization or firm client
    count, no in-house filers and no SoS page. The legacy total row gets
    nothing."""
    filings = [_filing("FIRM", "CLIENT A", "H100"), _filing("SOLO", "NO CLIENT", "H100", "Neutral"),
               _filing("SOLO", "TOTAL SALARIES PAID", "H100")]
    registrants = [_registrant("FIRM", 2025, clients=[("CLIENT A", 10.0)]),
                   _registrant("SOLO", 2025, "Lobbyist", clients=[("NO CLIENT", 5.0)])]
    registrations = [_registration("SOLO", 2025, clients=[{"name": "No client", "nameNorm": "NO CLIENT"}])]
    db, doc_mocks, clients = _run_stats(registrants=registrants, registrations=registrations, filings=filings)
    nc = clients["NO CLIENT"]
    assert (nc["placeholder"], nc["registrationUrl"], nc["firstRegistered"], nc["inHouseCount"]) == (
        True, None, None, 0)
    c = nc["courts"]["194"]
    assert (c["filings"], c["bills"], c["lobbyistCount"], c["inHouseFilers"]) == (1, 1, 1, [])
    assert "TOTAL SALARIES PAID" not in clients
    for doc in ("clientList_194", "clientList_all"):
        rows = _captured_data(doc_mocks[doc])
        assert (rows["NO CLIENT"]["placeholder"], "placeholder" in rows["CLIENT A"]) == (True, False)
    (bill,) = _batch_set_dicts_with_key(db, "orgSupport")
    assert (bill["total"], bill["clients"], bill["orgNeutral"], bill["orgLatestNeutral"]) == (3, 1, 0, 0)
    stats = _stats_doc(doc_mocks)
    assert (stats["totalClients"], stats["courts"]["194"]["clients"], stats["courts"]["194"]["paid"]) == (1, 1, 15.0)
    assert _captured_data(doc_mocks["clientFilingCounts"])["NO CLIENT"] == 1
    firms = {d["entityNameNorm"]: d for d in _batch_set_dicts_with_key(db, "hasFilings")}
    assert (firms["SOLO"]["clientCount"], firms["SOLO"]["courts"]["194"]["clientCount"]) == (0, 0)


def test_compute_stats_counts_hired_firms_that_name_no_agents():
    """A hired firm naming no agents for the client adds nobody to
    individuals, so it's counted on its own; a hired individual isn't a firm."""
    registrants = [
        _registrant("NAMING FIRM", 2025, clients=[("CLIENT A", 1.0)],
                    clientLobbyists={"CLIENT A": ["Agent One", "Agent Two", "Agent Three"]}),
        _registrant("SILENT FIRM", 2025, clients=[("CLIENT A", 1.0)]),
        _registrant("INDIE", 2025, "Lobbyist", clients=[("CLIENT A", 1.0)]),
    ]
    registrations = [_registration("INDIE", 2025, employers=[{"name": "Other", "nameNorm": "OTHER"}])]
    _, _, clients = _run_stats(registrants=registrants, registrations=registrations)
    c = clients["CLIENT A"]["courts"]["194"]
    assert (c["firmAgents"], c["hiredFirms"], c["firmsWithoutAgents"]) == (4, 3, 1)
    assert c["individuals"] + c["firmsWithoutAgents"] == 5  # three agents, the independent, the silent firm


def test_compute_stats_puts_each_clients_in_house_filers_on_its_summary():
    registrations = [_registration("STAFFER", 2025, clients=[{"name": "Client A", "nameNorm": "CLIENT A"}])]
    filings = [_filing("STAFFER", "CLIENT A"), _filing("CLIENT A", "CLIENT A"), _filing("FIRM", "CLIENT A")]
    registrants = [_registrant("FIRM", 2025, clients=[("CLIENT A", 1.0)])]
    _, doc_mocks, clients = _run_stats(registrants=registrants, registrations=registrations, filings=filings)
    assert clients["CLIENT A"]["courts"]["194"]["inHouseFilers"] == ["CLIENT A", "STAFFER"]
    assert _captured_data(doc_mocks["inHouseFilers_194"])["CLIENT A"] == ["CLIENT A", "STAFFER"]


def test_compute_stats_counts_each_organization_once_by_its_latest_period():
    """As on the Bill page: an organization counts once, by the positions its
    filers reported in its latest half-year; several make it "multiple"."""
    h1, h2 = {"periodEnd": "2025-06-30"}, {"periodEnd": "2025-12-31"}
    filings = [
        _filing("FIRM", "SWITCHED", "H100", "Support", **h1),
        _filing("FIRM", "SWITCHED", "H100", "Oppose", **h2),          # latest: oppose
        _filing("FIRM 1", "SPLIT", "H100", "Support", **h2),
        _filing("FIRM 2", "SPLIT", "H100", "Neutral", **h2),          # latest: multiple
        _filing("FIRM", "SUPPORTER", "H100", "Support", **h2),
        _filing("FIRM 2", "SUPPORTER", "H100", "", **h2),             # none beside support: support
        _filing("FIRM", "SILENT", "H100", "", **h2),                  # only none: not counted
        _filing("FIRM", "OLDER", "H100", "Neutral"),                  # no periodEnd: its year
    ]
    db, _, _ = _run_stats(filings=filings)
    (bill,) = _batch_set_dicts_with_key(db, "orgLatestSupport")
    assert (bill["orgLatestSupport"], bill["orgLatestOppose"], bill["orgLatestNeutral"],
            bill["orgLatestMultiple"]) == (1, 1, 1, 1)
    assert bill["clients"] == 5  # SILENT counts as an organization, with no position


def test_compute_stats_writes_one_client_list_per_session_and_one_for_all():
    filings = [_filing("FIRM", "CLIENT A", "H1"), _filing("FIRM", "CLIENT A", "H2"),
               _filing("FIRM", "CLIENT A", "H3", court=193, year=2023)]
    registrants = [_registrant("FIRM", 2025, clients=[("CLIENT A", 10.0)]),
                   _registrant("FIRM", 2023, clients=[("CLIENT A", 4.0)])]
    _, doc_mocks, _ = _run_stats(registrants=registrants, filings=filings)
    s194 = _captured_data(doc_mocks["clientList_194"])["CLIENT A"]
    s193 = _captured_data(doc_mocks["clientList_193"])["CLIENT A"]
    assert (s194["name"], s194["bills"], s194["compensation"]) == ("CLIENT A", 2, 10.0)
    assert (s193["bills"], s193["compensation"]) == (1, 4.0)
    every = _captured_data(doc_mocks["clientList_all"])
    assert list(every) == ["CLIENT A"] and (every["CLIENT A"]["bills"], every["CLIENT A"]["compensation"]) == (3, 14.0)


def test_compute_stats_writes_one_lobbyist_list_per_session():
    """A lobbyist or entity is in a session when it registered in one of the
    session's years, with that session's own counts."""
    registrants = [_registrant("FIRM", 2025, clients=[("CLIENT A", 1.0)]),
                   _registrant("FIRM", 2023, clients=[("CLIENT A", 1.0), ("CLIENT B", 1.0)])]
    filings = [_filing("FIRM", "CLIENT A", "H1")]
    _, doc_mocks, _ = _run_stats(registrants=registrants, filings=filings)
    s194 = _captured_data(doc_mocks["firmList_194"])["FIRM"]
    s193 = _captured_data(doc_mocks["firmList_193"])["FIRM"]
    assert (s194["clientCount"], s194["filings"], s194["years"]) == (1, 1, [2025, 2023])
    assert (s193["clientCount"], s193["filings"], s193["totalFilings"]) == (2, 0, 1)


def test_compute_stats_removes_a_stale_session_list():
    """A session with filings but no client rows keeps no client list doc."""
    filings = [_filing("FIRM", "NO CLIENT", "H1")]
    _, doc_mocks, _ = _run_stats(filings=filings)
    assert doc_mocks["clientList_194"].delete.called
    assert not doc_mocks["clientList_194"].set.called
