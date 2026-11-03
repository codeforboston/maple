"""Export the lobbying data as CSV files for download.

Writes one CSV per kind of record, a README describing every column and a
manifest with row counts and checksums, and zips them. It exports the fields
the scraper stores, with each list flattened into a file of its own, and adds
no identifiers or links. Every name comes with MAPLE's normalized form: where
none is stored (agents per client, and older docs), it's computed with the
scraper's normalization, as compute_stats does. It only reads from Firestore.

    GOOGLE_APPLICATION_CREDENTIALS=... python3 export.py \\
      --project <project> --out <dir>

Export a project only after its data has been rebuilt with the current parser
(see "Backfilling Newly Parsed Fields" in
docs/lobbying-disclosure-ingestion.md); it warns if filings lack a period.
"""
from __future__ import annotations

import argparse
import contextlib
import csv
import hashlib
import json
import zipfile
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Callable

from google.cloud import firestore
from normalize import normalize_entity_name
from portal import FIRST_GC, FIRST_GC_START_YEAR, year_to_general_court
from writer import (
    FILINGS_COLLECTION,
    REGISTRANTS_COLLECTION,
    REGISTRATIONS_COLLECTION,
    _iter_collection,
    _party_norm,
)


@dataclass
class Table:
    file: str
    about: str
    columns: list[tuple[str, str]]  # (column, description)

    @property
    def names(self) -> list[str]:
        return [name for name, _ in self.columns]


_REGISTRANT_ID = ("registrantId", "The report, as in registrants.csv.")
_REGISTRATION_ID = ("registrationId", "The registration, as in registrations.csv.")
_NORM = (
    "MAPLE's normalized form of the name (upper case, without punctuation, "
    "legal suffixes such as LLC, or d/b/a names), for grouping spellings of "
    "one name. Different people or organizations can share a name."
)
_FETCHED_AT = ("fetchedAt", "When MAPLE last read this from the Secretary of State's site (UTC).")

REGISTRANTS = Table(
    "registrants.csv",
    "One row per disclosure report: a lobbyist's or lobbying entity's report "
    "for one half-year.",
    [
        ("registrantId", "MAPLE's ID for the report: a hash of the filer's name, "
         "the year and the start of the period. Each report has its own, so it "
         "doesn't identify the filer from one report to the next."),
        ("entityName", "The filer's name, as on the report."),
        ("entityNameNorm", _NORM),
        ("regType", "Lobbyist (an individual) or Employer (a lobbying entity, "
         '"Lobbyist Entity" on the site).'),
        ("year", "The report's year."),
        ("generalCourt", "The legislative session (see Sessions)."),
        ("periodStart", "First day of the half-year the report covers."),
        ("periodEnd", "Last day of the half-year the report covers."),
        ("legacyTotalCompensation", "A lobbying entity's total compensation, on "
         "reports that give a total rather than an amount per client (mostly "
         "2005–2009)."),
        _FETCHED_AT,
    ],
)

REGISTRANT_CLIENTS = Table(
    "registrant_clients.csv",
    "Each client on a disclosure report, with the compensation reported for it.",
    [
        _REGISTRANT_ID,
        ("clientName", "The client's name, as on the report."),
        ("clientNameNorm", _NORM),
        ("compensation", "Compensation reported from this client for the period, "
         "in dollars."),
    ],
)

REGISTRANT_LOBBYISTS = Table(
    "registrant_lobbyists.csv",
    "The lobbyists a lobbying entity reports paying, per report.",
    [
        _REGISTRANT_ID,
        ("lobbyist", "The lobbyist's name, as on the report."),
        ("lobbyistNorm", _NORM),
    ],
)

REGISTRANT_CLIENT_LOBBYISTS = Table(
    "registrant_client_lobbyists.csv",
    "The lobbyists a lobbying entity's report names as working for each client "
    "(reports from 2014 on; earlier reports don't name them).",
    [
        _REGISTRANT_ID,
        ("clientNameNorm", "The client, as clientNameNorm in "
         "registrant_clients.csv."),
        ("lobbyist", "The lobbyist's name, as on the report."),
        ("lobbyistNorm", _NORM),
    ],
)

REGISTRANT_DISCLOSURES = Table(
    "registrant_disclosures.csv",
    "Each report's page on the Secretary of State's site.",
    [_REGISTRANT_ID, ("disclosureUrl", "The report's page.")],
)

FILINGS = Table(
    "filings.csv",
    "One row per activity on a disclosure report: a bill or other matter "
    "lobbied on for a client in a half-year, with the position taken and the "
    "amount.",
    [
        ("filingId", "MAPLE's ID for the row: a hash of the filer, client, "
         "chamber, bill or matter, session, position and start of the period."),
        ("entityName", "The filer's name, as on the report."),
        ("entityNameNorm", _NORM),
        ("clientName", "The client's name, as on the report."),
        ("clientNameNorm", _NORM),
        ("year", "The report's year."),
        ("generalCourt", "The legislative session (see Sessions)."),
        ("periodStart", "First day of the half-year the report covers."),
        ("periodEnd", "Last day of the half-year the report covers."),
        ("chamber", "House Bill, Senate Bill, House Docket, Senate Docket, "
         "Executive (lobbying of the executive branch) or Other (rare older "
         "codes)."),
        ("billId", "For the House and Senate chambers, the bill or docket "
         "number within the session, e.g. H1234 or SD56; filers enter 0 (H0, "
         "S0) for activity on no bill yet. Blank for other chambers, and where "
         "a report gives no number."),
        ("agency", "For Executive activity, the agency the report names, where "
         "it names one."),
        ("activityTitle", "The bill's title, or a description of the activity."),
        ("position", "The position reported, e.g. Support, Oppose or Neutral; "
         "can be blank."),
        ("amount", "The amount the report lists for this activity, in dollars."),
        ("disclosureUrl", "The report's page, as in registrant_disclosures.csv."),
        _FETCHED_AT,
    ],
)

REGISTRATIONS = Table(
    "registrations.csv",
    "One row per registration: a lobbyist or lobbying entity registered for a "
    "year. Includes lobbyists who file no report themselves because the entity "
    "employing them reports for them.",
    [
        ("registrationId", "MAPLE's ID for the registration: a hash of its type, "
         "year and name. Each year has its own."),
        ("name", "The registrant's name, as on the registration."),
        ("nameNorm", _NORM),
        ("regType", "Lobbyist (an individual) or Employer (a lobbying entity)."),
        ("year", "The registration's year."),
        _FETCHED_AT,
    ],
)

REGISTRATION_PARTIES = Table(
    "registration_parties.csv",
    "The people and organizations on each registration.",
    [
        _REGISTRATION_ID,
        ("role", "lobbyist (a lobbyist the entity employs), employer (an entity "
         "employing the lobbyist; listed from 2019) or client."),
        ("name", "The party's name, as on the registration."),
        ("nameNorm", _NORM),
        ("amount", "Salary paid or received, or the client's compensation, in "
         "dollars."),
        ("startDate", "When the relationship started."),
        ("endDate", "When it ended, if it has."),
        ("purpose", "The client's stated purpose (clients only)."),
        ("sourceUrl", "The party's own registration page, where the site links "
         "one (for lobbyists, from 2019)."),
    ],
)

REGISTRATION_SOURCES = Table(
    "registration_sources.csv",
    "Each registration's page on the Secretary of State's site.",
    [_REGISTRATION_ID, ("sourceUrl", "The registration's page.")],
)

REGISTRATION_DISCLOSURES = Table(
    "registration_disclosures.csv",
    "The disclosure reports a registration's page links to.",
    [_REGISTRATION_ID, ("disclosureUrl", "The report's page, as in "
                        "registrant_disclosures.csv.")],
)

TABLES = [
    REGISTRANTS,
    REGISTRANT_CLIENTS,
    REGISTRANT_LOBBYISTS,
    REGISTRANT_CLIENT_LOBBYISTS,
    REGISTRANT_DISCLOSURES,
    FILINGS,
    REGISTRATIONS,
    REGISTRATION_PARTIES,
    REGISTRATION_SOURCES,
    REGISTRATION_DISCLOSURES,
]

_PARTY_ROLES = {"lobbyists": "lobbyist", "employers": "employer", "clients": "client"}

Rows = dict[str, list[list]]


def _cell(value):
    if value is None:
        return ""
    if isinstance(value, datetime):
        return value.isoformat()
    return value


def _row(table: Table, item: dict, **parent) -> list:
    item = {**item, **parent}
    return [_cell(item.get(name)) for name in table.names]


def _unexported(doc: dict, exported: set[str], children: dict[str, Table]) -> set[str]:
    """Fields of doc that no column holds, so none is dropped silently."""
    missing = {k for k in doc if k not in exported and k not in children}
    for field, table in children.items():
        for item in doc.get(field) or []:
            missing |= {f"{field}.{k}" for k in item if k not in table.names}
    return missing


def registrant_rows(doc: dict) -> tuple[Rows, set[str]]:
    rid = doc.get("registrantId")
    lobbyists = doc.get("lobbyists") or []
    norms = doc.get("lobbyistsNorm") or []
    rows = {
        REGISTRANTS.file: [_row(REGISTRANTS, doc)],
        REGISTRANT_CLIENTS.file: [
            _row(REGISTRANT_CLIENTS, c, registrantId=rid)
            for c in doc.get("clients") or []
        ],
        REGISTRANT_LOBBYISTS.file: [
            [rid, name, norms[i] if i < len(norms) else normalize_entity_name(name)]
            for i, name in enumerate(lobbyists)
        ],
        REGISTRANT_CLIENT_LOBBYISTS.file: [
            [rid, client, name, normalize_entity_name(name)]
            for client, names in sorted((doc.get("clientLobbyists") or {}).items())
            for name in names
        ],
        REGISTRANT_DISCLOSURES.file: [
            [rid, url] for url in doc.get("disclosureUrls") or []
        ],
    }
    exported = set(REGISTRANTS.names) | {
        "lobbyists", "lobbyistsNorm", "clientLobbyists", "disclosureUrls",
    }
    return rows, _unexported(doc, exported, {"clients": REGISTRANT_CLIENTS})


def filing_rows(doc: dict) -> tuple[Rows, set[str]]:
    return {FILINGS.file: [_row(FILINGS, doc)]}, _unexported(doc, set(FILINGS.names), {})


def registration_rows(doc: dict) -> tuple[Rows, set[str]]:
    rid = doc.get("registrationId")
    rows = {
        REGISTRATIONS.file: [_row(REGISTRATIONS, doc)],
        REGISTRATION_PARTIES.file: [
            _row(REGISTRATION_PARTIES, p, registrationId=rid, role=role,
                 nameNorm=_party_norm(p))
            for field, role in _PARTY_ROLES.items()
            for p in doc.get(field) or []
        ],
        REGISTRATION_SOURCES.file: [[rid, url] for url in doc.get("sourceUrls") or []],
        REGISTRATION_DISCLOSURES.file: [
            [rid, url] for url in doc.get("disclosureUrls") or []
        ],
    }
    exported = set(REGISTRATIONS.names) | {"sourceUrls", "disclosureUrls"}
    children = {field: REGISTRATION_PARTIES for field in _PARTY_ROLES}
    return rows, _unexported(doc, exported, children)


COLLECTIONS: dict[str, Callable[[dict], tuple[Rows, set[str]]]] = {
    REGISTRANTS_COLLECTION: registrant_rows,
    FILINGS_COLLECTION: filing_rows,
    REGISTRATIONS_COLLECTION: registration_rows,
}


def court_years(gc: int) -> tuple[int, int]:
    start = FIRST_GC_START_YEAR + (gc - FIRST_GC) * 2
    return start, start + 1


def readme(manifest: dict) -> str:
    first, last = manifest["generalCourts"]
    sessions = "\n".join(
        f"| {gc} | {a}–{b} |" for gc in range(first, last + 1)
        for a, b in [court_years(gc)]
    )
    next_a, next_b = court_years(last + 1)
    files = "\n".join(
        f"| `{t.file}` | {manifest['files'][t.file]['rows']:,} | {t.about} |"
        for t in TABLES
    )
    columns = "\n\n".join(
        f"### `{t.file}`\n\n{t.about}\n\n| Column | Description |\n| --- | --- |\n"
        + "\n".join(f"| `{name}` | {about} |" for name, about in t.columns)
        for t in TABLES
    )
    return f"""# Massachusetts lobbying disclosures

Lobbying registrations and disclosure reports filed with the Massachusetts
Secretary of State (Lobbyist Public Search,
https://www.sec.state.ma.us/LobbyistPublicSearch/), {manifest["years"][0]}–{manifest["years"][1]},
as collected by MAPLE. Exported {manifest["generatedAt"][:10]}; the most recent
record was read from the Secretary of State's site on {(manifest["dataAsOf"] or "")[:10]}.
`manifest.json` lists each file's row count and SHA-256 checksum.

## Files

All files are UTF-8 CSV with a header row. An empty cell means the report
didn't give the value.

| File | Rows | Contents |
| --- | --- | --- |
{files}

How they connect:

- A disclosure report is a row of `registrants.csv`. Its clients, its
  lobbyists and its page are in the `registrant_*.csv` files, by
  `registrantId`.
- Its activity is in `filings.csv`, which shares the report's `disclosureUrl`
  (and its `entityName`, `periodStart` and `periodEnd`).
- A registration is a row of `registrations.csv`. Its lobbyists, employers and
  clients are in `registration_parties.csv`, and its pages in the other
  `registration_*.csv` files, by `registrationId`.
- Registrations and reports share no ID. Match them by name and year, or by a
  `disclosureUrl` in both `registration_disclosures.csv` and
  `registrant_disclosures.csv`.

## Identifiers and links

`registrantId`, `filingId` and `registrationId` are MAPLE's IDs for single
records. They're hashes of each record's name, year and so on. They don't follow
a lobbyist, entity or client from year to year, and the data has no ID that
does: the `…Norm` names are the closest, so check before treating one name as
one person or organization.

Every link is to the record's page on the Secretary of State's site, as MAPLE
read it.

## Amounts

Amounts are in dollars, as reported.

- `registrant_clients.compensation` is the compensation a report gives for each
  client. `filings.amount` is the amount it lists for one activity. The two can
  cover the same money, so don't add them together.
- A lobbyist who works for a lobbying entity lists no clients: the entity
  reports them.
- Reports from 2005–2008 list no client compensation and no amount per
  activity. A lobbying entity's report gives its total instead, in
  `registrants.legacyTotalCompensation`, as a few later ones do.
- "No client" is how the site records a lobbyist's period with no client. It
  isn't an organization.

## Sessions

`generalCourt` is the two-year legislative session:

| General Court | Years |
| --- | --- |
{sessions}

The {next_a}–{next_b} session will be General Court {last + 1}. Its reports
appear in exports made after they're filed.

## Updates

Lobbyists and lobbying entities register with the Secretary of State each year
and file a disclosure report for each half-year (January–June and
July–December). When a report is amended, this export has only the latest
version. MAPLE checks the Secretary of State's site for new and amended
reports weekly. `fetchedAt` shows when each record was last read.

## Not included

- Expenditures and campaign contributions. Reports list operating,
  advertising and other expenses, and campaign contributions. MAPLE doesn't
  store these, but they're on each report's page (`disclosureUrl`).
- Lobbyists per client before 2014, and employers of individual lobbyists
  before 2019: the site's pages don't give them.

## Columns

{columns}
"""


def export(db: firestore.Client, out: Path, project: str) -> Path:
    """Write the export under out and return the path of its zip."""
    now = datetime.now(tz=timezone.utc)
    name = f"lobbying-export-{now:%Y-%m-%d}"
    folder = out / name
    folder.mkdir(parents=True, exist_ok=True)

    counts = {t.file: 0 for t in TABLES}
    unexported: dict[str, set[str]] = {}
    years: set[int] = set()
    latest: datetime | None = None
    filings_without_period = 0

    with contextlib.ExitStack() as stack:
        writers = {}
        for t in TABLES:
            f = stack.enter_context(open(folder / t.file, "w", newline="", encoding="utf-8"))
            writers[t.file] = csv.writer(f)
            writers[t.file].writerow(t.names)

        for collection, to_rows in COLLECTIONS.items():
            n = 0
            for snap in _iter_collection(db, collection):
                doc = snap.to_dict()
                rows, missing = to_rows(doc)
                for file, file_rows in rows.items():
                    writers[file].writerows(file_rows)
                    counts[file] += len(file_rows)
                if missing:
                    unexported.setdefault(collection, set()).update(missing)
                if isinstance(doc.get("year"), int):
                    years.add(doc["year"])
                fetched = doc.get("fetchedAt")
                if isinstance(fetched, datetime) and (latest is None or fetched > latest):
                    latest = fetched
                if collection == FILINGS_COLLECTION and not doc.get("periodStart"):
                    filings_without_period += 1
                n += 1
                if n % 50000 == 0:
                    print(f"  {collection}: {n:,}")
            print(f"{collection}: {n:,} docs")

    def sha256(path: Path) -> str:
        h = hashlib.sha256()
        with open(path, "rb") as f:
            for chunk in iter(lambda: f.read(1 << 20), b""):
                h.update(chunk)
        return h.hexdigest()

    manifest = {
        "generatedAt": now.isoformat(),
        "project": project,
        "dataAsOf": latest.isoformat() if latest else None,
        "years": [min(years), max(years)] if years else [None, None],
        "generalCourts": [year_to_general_court(min(years)), year_to_general_court(max(years))]
        if years else [None, None],
        "files": {
            t.file: {"rows": counts[t.file], "sha256": sha256(folder / t.file)}
            for t in TABLES
        },
        "filingsWithoutPeriod": filings_without_period,
        "unexportedFields": {c: sorted(f) for c, f in sorted(unexported.items())},
    }
    (folder / "README.md").write_text(readme(manifest), encoding="utf-8")
    (folder / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")

    if filings_without_period:
        print(f"WARNING: {filings_without_period:,} filings have no period; "
              "rebuild the data with the current parser before sharing this.")
    if unexported:
        print(f"WARNING: fields with no column: {manifest['unexportedFields']}")

    zip_path = out / f"{name}.zip"
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as z:
        for path in sorted(folder.iterdir()):
            z.write(path, f"{name}/{path.name}")
    print(f"Wrote {zip_path} ({zip_path.stat().st_size / 1e6:.1f} MB)")
    return zip_path


def main() -> None:
    p = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    p.add_argument("--project", required=True, help="GCP project to export")
    p.add_argument("--out", type=Path, default=Path("."), help="directory to write into")
    args = p.parse_args()
    export(firestore.Client(project=args.project), args.out, args.project)


if __name__ == "__main__":
    main()
