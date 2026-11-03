"""Unit tests for the CSV export in export.py. No live database is needed."""

from __future__ import annotations

import csv
import io
import json
import sys
import zipfile
from datetime import datetime, timezone
from pathlib import Path
from types import SimpleNamespace

sys.path.insert(0, str(Path(__file__).parent.parent))

import export
from export import (
    FILINGS,
    REGISTRANT_CLIENT_LOBBYISTS,
    REGISTRANT_CLIENTS,
    REGISTRANT_DISCLOSURES,
    REGISTRANT_LOBBYISTS,
    REGISTRANTS,
    REGISTRATION_PARTIES,
    REGISTRATION_SOURCES,
    TABLES,
    filing_rows,
    registrant_rows,
    registration_rows,
)

FETCHED = datetime(2026, 10, 30, 12, 0, tzinfo=timezone.utc)
URL = "https://www.sec.state.ma.us/LobbyistPublicSearch/CompleteDisclosure.aspx?sysvalue=abc"

REGISTRANT = {
    "registrantId": "r1",
    "entityName": "Example Strategies, LLC",
    "entityNameNorm": "EXAMPLE STRATEGIES",
    "year": 2025,
    "generalCourt": 194,
    "regType": "Employer",
    "clients": [
        {"clientName": "Example Society, Inc.", "clientNameNorm": "EXAMPLE SOCIETY", "compensation": 12000.0},
        {"clientName": "Sample Fund", "clientNameNorm": "SAMPLE FUND", "compensation": None},
    ],
    "legacyTotalCompensation": None,
    "periodStart": "2025-01-01",
    "periodEnd": "2025-06-30",
    "lobbyists": ["Alex Doe", "Sam Roe"],
    "lobbyistsNorm": ["ALEX DOE", "SAM ROE"],
    "clientLobbyists": {"SAMPLE FUND": ["Sam Roe"], "EXAMPLE SOCIETY": ["Alex Doe", "Sam Roe"]},
    "disclosureUrls": [URL],
    "fetchedAt": FETCHED,
}

FILING = {
    "filingId": "f1",
    "entityName": "Example Strategies, LLC",
    "entityNameNorm": "EXAMPLE STRATEGIES",
    "clientName": "Example Society, Inc.",
    "clientNameNorm": "EXAMPLE SOCIETY",
    "year": 2025,
    "generalCourt": 194,
    "chamber": "House Bill",
    "billId": "H1234",
    "agency": None,
    "activityTitle": "An Act relative to examples",
    "position": "Support",
    "amount": 0.0,
    "disclosureUrl": URL,
    "periodStart": "2025-01-01",
    "periodEnd": "2025-06-30",
    "fetchedAt": FETCHED,
}

REGISTRATION = {
    "registrationId": "g1",
    "name": "Example Strategies, LLC",
    "nameNorm": "EXAMPLE STRATEGIES",
    "year": 2025,
    "regType": "Employer",
    "lobbyists": [
        {"name": "Alex Doe", "nameNorm": "ALEX DOE", "sourceUrl": "https://example.test/l",
         "amount": 5000.0, "startDate": "2025-01-02", "endDate": None, "purpose": None},
    ],
    "employers": [],
    "clients": [
        {"name": "Sample Fund", "nameNorm": "SAMPLE FUND", "sourceUrl": None,
         "amount": 3000.0, "startDate": "2025-01-02", "endDate": "2025-12-31", "purpose": "Advocacy"},
    ],
    "disclosureUrls": [URL],
    "sourceUrls": ["https://example.test/g1"],
    "fetchedAt": FETCHED,
}


def _by_column(table, row):
    return dict(zip(table.names, row))


def test_registrant_rows_flatten_each_list():
    rows, unexported = registrant_rows(REGISTRANT)

    assert unexported == set()
    [main] = rows[REGISTRANTS.file]
    assert _by_column(REGISTRANTS, main) == {
        "registrantId": "r1",
        "entityName": "Example Strategies, LLC",
        "entityNameNorm": "EXAMPLE STRATEGIES",
        "regType": "Employer",
        "year": 2025,
        "generalCourt": 194,
        "periodStart": "2025-01-01",
        "periodEnd": "2025-06-30",
        "legacyTotalCompensation": "",
        "fetchedAt": "2026-10-30T12:00:00+00:00",
    }
    assert rows[REGISTRANT_CLIENTS.file] == [
        ["r1", "Example Society, Inc.", "EXAMPLE SOCIETY", 12000.0],
        ["r1", "Sample Fund", "SAMPLE FUND", ""],
    ]
    assert rows[REGISTRANT_LOBBYISTS.file] == [
        ["r1", "Alex Doe", "ALEX DOE"],
        ["r1", "Sam Roe", "SAM ROE"],
    ]
    assert rows[REGISTRANT_CLIENT_LOBBYISTS.file] == [
        ["r1", "EXAMPLE SOCIETY", "Alex Doe", "ALEX DOE"],
        ["r1", "EXAMPLE SOCIETY", "Sam Roe", "SAM ROE"],
        ["r1", "SAMPLE FUND", "Sam Roe", "SAM ROE"],
    ]
    assert rows[REGISTRANT_DISCLOSURES.file] == [["r1", URL]]


def test_registrant_rows_without_optional_fields():
    # Docs written before agents and firm lobbyists were parsed lack them.
    doc = {k: v for k, v in REGISTRANT.items()
           if k not in ("lobbyists", "lobbyistsNorm", "clientLobbyists")}
    rows, unexported = registrant_rows(doc)
    assert unexported == set()
    assert rows[REGISTRANT_LOBBYISTS.file] == []
    assert rows[REGISTRANT_CLIENT_LOBBYISTS.file] == []


def test_names_without_a_stored_normal_form_get_one():
    # Older docs may lack lobbyistsNorm and parties' nameNorm.
    doc = {k: v for k, v in REGISTRANT.items() if k != "lobbyistsNorm"}
    rows, _ = registrant_rows(doc)
    assert rows[REGISTRANT_LOBBYISTS.file] == [
        ["r1", "Alex Doe", "ALEX DOE"],
        ["r1", "Sam Roe", "SAM ROE"],
    ]
    party = {k: v for k, v in REGISTRATION["clients"][0].items() if k != "nameNorm"}
    rows, _ = registration_rows({**REGISTRATION, "lobbyists": [], "clients": [party]})
    [row] = rows[REGISTRATION_PARTIES.file]
    assert _by_column(REGISTRATION_PARTIES, row)["nameNorm"] == "SAMPLE FUND"


def test_filing_rows_keep_every_field():
    rows, unexported = filing_rows(FILING)
    assert unexported == set()
    [row] = rows[FILINGS.file]
    assert _by_column(FILINGS, row) == {
        **FILING, "agency": "", "fetchedAt": "2026-10-30T12:00:00+00:00",
    }


def test_registration_rows_label_each_party_by_role():
    rows, unexported = registration_rows(REGISTRATION)
    assert unexported == set()
    parties = [_by_column(REGISTRATION_PARTIES, r) for r in rows[REGISTRATION_PARTIES.file]]
    assert [(p["role"], p["name"], p["amount"]) for p in parties] == [
        ("lobbyist", "Alex Doe", 5000.0),
        ("client", "Sample Fund", 3000.0),
    ]
    assert parties[1]["purpose"] == "Advocacy"
    assert rows[REGISTRATION_SOURCES.file] == [["g1", "https://example.test/g1"]]


def test_fields_without_a_column_are_reported():
    _, unexported = registrant_rows({
        **REGISTRANT,
        "newField": 1,
        "clients": [{**REGISTRANT["clients"][0], "share": 0.5}],
    })
    assert unexported == {"newField", "clients.share"}


def test_export_writes_csvs_readme_manifest_and_zip(tmp_path, monkeypatch):
    docs = {
        "lobbyingRegistrants": [REGISTRANT],
        "lobbyingFilings": [FILING, {**FILING, "filingId": "f2", "periodStart": None}],
        "lobbyingRegistrations": [REGISTRATION],
    }
    monkeypatch.setattr(
        export, "_iter_collection",
        lambda db, name: [SimpleNamespace(to_dict=lambda d=d: d) for d in docs[name]],
    )

    zip_path = export.export(None, tmp_path, "demo-project")

    with zipfile.ZipFile(zip_path) as z:
        names = {Path(n).name for n in z.namelist()}
        assert names == {t.file for t in TABLES} | {"README.md", "manifest.json"}
        folder = Path(z.namelist()[0]).parent
        manifest = json.loads(z.read(f"{folder}/manifest.json"))
        filings = list(csv.reader(io.TextIOWrapper(z.open(f"{folder}/filings.csv"), "utf-8")))
        readme = z.read(f"{folder}/README.md").decode()

    assert filings[0] == FILINGS.names
    assert [r[0] for r in filings[1:]] == ["f1", "f2"]
    assert manifest["files"]["filings.csv"]["rows"] == 2
    assert manifest["files"]["registrant_client_lobbyists.csv"]["rows"] == 3
    assert manifest["years"] == [2025, 2025]
    assert manifest["generalCourts"] == [194, 194]
    assert manifest["dataAsOf"] == "2026-10-30T12:00:00+00:00"
    assert manifest["filingsWithoutPeriod"] == 1
    assert manifest["unexportedFields"] == {}
    assert "| 194 | 2025–2026 |" in readme
    assert "General Court 195" in readme
    for t in TABLES:
        assert f"### `{t.file}`" in readme
