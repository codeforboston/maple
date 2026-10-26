# Lobbying Disclosure Ingestion Pipeline

## Overview

The MA Secretary of State lobbying portal
([sec.state.ma.us/LobbyistPublicSearch](https://www.sec.state.ma.us/LobbyistPublicSearch/))
publishes semi-annual disclosure filings for all registered lobbyists and
lobbying entities. This document describes the plan for scraping that data and
storing it in Firestore in a way that allows joining to MAPLE bill data.

The portal has three levels of pages:

1. **Search page** → one row per registrant per year
2. **Summary page** → registrant metadata + links to semi-annual disclosure
   filings. Each amendment is a separate page, listed as "Report amendment
   M/D/YYYY" right above the filing it amends, newest first. Only the newest
   version of each filing is ingested; earlier versions are skipped, and their
   filings removed.
3. **CompleteDisclosure page** → per-client compensation table + per-client bill
   activity tables

Historical data goes back to 2005. MAPLE has bill data only from ~2020 onward,
so bill joins will only resolve for filings from the 192nd General Court (2021)
and later. All historical filings are ingested regardless.

---

## Terminology

The portal has two registrant types:

- **Lobbyist** — an individual person who lobbies. An individual account may
  have at most one client per reporting period; anyone serving more than one
  client should register as a lobbyist entity. That one client may be the
  lobbyist's employer (in-house staff) or an organization that contracted them.
  A lobbyist working for a firm registers under the firm and lists no clients.
- **Employer** — a lobbying firm or other entity that employs individual
  lobbyists and is retained by clients. Called "Lobbyist Entity" on the portal.

Each registrant reports compensation received from each **client** and which
bills they lobbied for that client. The law treats a client employing an agent
and one retaining an agent alike (M.G.L. c. 3, §§ 39 and 41), and the portal
records both the same way: every individual's page shows an "Employed" date and
"Total salaries received", so it never says whether a single-client lobbyist is
staff or a contractor. Sources: the Secretary's _Online User Guide: Getting
Started_ (Lobbyist Division, December 2020, "Account types") and
[M.G.L. c. 3, § 39](https://malegislature.gov/Laws/GeneralLaws/PartI/TitleI/Chapter3/Section39).

---

## Firestore Data Model

Two top-level collections, normalized by registrant and by lobbying activity
record.

### `/lobbyingRegistrants/{registrantId}`

`registrantId` is a SHA-256 hash (first 40 hex chars) of the entity name, year
and reporting-period start (one doc per entity per half-year). Hashing avoids sanitizing arbitrary Unicode and
punctuation in entity names to fit Firestore ID constraints while remaining
stable and dedup-safe across runs.

One model covers both individual lobbyists and lobbying firms. A separate model
is not needed because the portal search returns both under the same schema.

From 2014, a firm's disclosure has one activity block per agent per client,
headed "Sub-agent: X" (2014–2018) or "Lobbyist: X" (2019+), each repeating that
client's bills. We store the agents per client (`clientLobbyists`, for "agents
on this account"), not per bill: that would need a lobbyist field on filings
and a lobbyist in `filingId`. Before 2014 the pages name no agent per client.

```typescript
interface LobbyingRegistrant {
  registrantId: string // SHA-256 hash of "{entityName}_{year}"
  entityName: string // firm name or individual lobbyist name (raw portal value)
  entityNameNorm: string // normalized form; see Normalization section
  year: number
  generalCourt: number // computed from year
  regType: "Lobbyist" | "Employer"
  clients: LobbyingClient[]
  legacyTotalCompensation: number | null // pre-2009 entity total
  periodStart: string | null // half-year reporting window
  periodEnd: string | null
  lobbyists?: string[] // lobbyists a firm reports paying
  lobbyistsNorm?: string[]
  // Agents named on each client's activity blocks, keyed by clientNameNorm
  // (2014+; filled on older docs by the backfill below).
  clientLobbyists?: Record<string, string[]>
  disclosureUrls: string[] // source portal URLs, for audit trail
  fetchedAt: Timestamp
}

interface LobbyingClient {
  clientName: string
  clientNameNorm: string // normalized form
  compensation: number | null
}
```

**Example document** (`lobbyingRegistrants/0f11970cc6f17e35cc02685b794cb63a655c13b3`):

```json
{
  "registrantId": "0f11970cc6f17e35cc02685b794cb63a655c13b3",
  "entityName": "27 South Strategies, LLC",
  "entityNameNorm": "27 SOUTH STRATEGIES",
  "year": 2024,
  "generalCourt": 193,
  "regType": "Employer",
  "clients": [
    {
      "clientName": "The Massachusetts International Festival of the Arts, Inc.",
      "clientNameNorm": "MASSACHUSETTS INTERNATIONAL FESTIVAL OF ARTS",
      "compensation": 24000.0
    },
    {
      "clientName": "Veterinary Emergency Group, LLC",
      "clientNameNorm": "VETERINARY EMERGENCY GROUP",
      "compensation": 33000.0
    },
    {
      "clientName": "Gobrands, Inc",
      "clientNameNorm": "GOBRANDS",
      "compensation": 60000.0
    }
  ],
  "disclosureUrls": [
    "https://www.sec.state.ma.us/LobbyistPublicSearch/CompleteDisclosure.aspx?sysvalue=hTpfuAXM..."
  ]
}
```

### `/lobbyingFilings/{filingId}`

`filingId` is a SHA-256 hash (first 40 hex chars) of the logical key: entity
name, client name, chamber, activity reference, general court, position and
reporting-period start. It has no lobbyist, so a firm's agents reporting the
same bill for a client in one period share one filing.

```typescript
type LobbyingChamber =
  | "House Bill"
  | "Senate Bill"
  | "House Docket"
  | "Senate Docket"
  | "Executive" // lobbying of executive branch agencies
  | "Other" // catch-all for rare legacy codes (FY, CMR, etc.)

interface LobbyingFiling {
  filingId: string
  entityName: string // raw portal value
  entityNameNorm: string // normalized form
  clientName: string // raw portal value; "_total_salary_" sentinel for pre-2013
  clientNameNorm: string // normalized form
  year: number
  generalCourt: number
  chamber: LobbyingChamber
  // For legislative chambers: the bill number string (e.g. "H1234", "HD56").
  // For Executive: the agency name. Not a bill reference.
  billId: string | null
  activityTitle: string // bill title (legislative) or meeting description (executive)
  position: string // "Support" | "Oppose" | "Neutral" | etc.; empty for executive
  amount: number | null // compensation allocated to this activity
  disclosureUrl: string // the SoS disclosure page this activity was reported on
  // The disclosure's half-year window, e.g. "2025-01-01" to "2025-06-30"
  // (absent on docs the backfill below didn't reach)
  periodStart?: string | null
  periodEnd?: string | null
  fetchedAt: Timestamp
}
```

**Example documents** — query: `lobbyingFilings` where `generalCourt == 193` and `billId == "H1"`:

```json
[
  {
    "filingId": "0bac34faf2f624083daaaea57ee55f5364d2be29",
    "entityName": "Christina Ascolillo",
    "entityNameNorm": "CHRISTINA ASCOLILLO",
    "clientName": "American Council of Engineering Companies of Massachusetts",
    "clientNameNorm": "AMERICAN COUNCIL OF ENGINEERING COMPANIES OF MASSACHUSETTS",
    "year": 2023,
    "generalCourt": 193,
    "chamber": "House Bill",
    "billId": "H1",
    "activityTitle": "An Act making appropriations for the Fiscal Year 2024...",
    "position": "Neutral",
    "amount": 0.0
  },
  {
    "filingId": "109600251ca8fd279e8bb7562bc9d234c39f63a8",
    "entityName": "Christina Ascolillo",
    "entityNameNorm": "CHRISTINA ASCOLILLO",
    "clientName": "St. Mary's Center for Women and Children, Inc.",
    "clientNameNorm": "ST MARY S CENTER FOR WOMEN AND CHILDREN",
    "year": 2023,
    "generalCourt": 193,
    "chamber": "House Bill",
    "billId": "H1",
    "activityTitle": "An Act making appropriations for the Fiscal Year 2024...",
    "position": "Neutral",
    "amount": 0.0
  }
]
```

### `/lobbyingRegistrations/{registrationId}`

One doc per registration page (`Summary.aspx`): a lobbyist or lobbyist entity
in one year. It records people who never file a disclosure themselves because
the entity employing them files on their behalf. `registrationId` is a hash of
`registration|{regType}|{year}|{name}`; before 2019 the portal served one
identical page per firm per lobbyist, and those collapse into one doc.

```typescript
interface RegistrationParty {
  name: string
  nameNorm: string
  sourceUrl: string | null // that party's registration page (lobbyists: 2019+ only)
  amount: number | null // salary paid / received, or client compensation
  startDate: string | null // ISO date
  endDate: string | null
  purpose: string | null // clients only
}

interface LobbyingRegistration {
  registrationId: string
  name: string
  nameNorm: string
  year: number
  regType: "Lobbyist" | "Employer" // "Employer" = SoS "Lobbyist Entity"
  lobbyists: RegistrationParty[] // entities: lobbyists they employ
  employers: RegistrationParty[] // individuals: entities employing them (2019+)
  clients: RegistrationParty[]
  disclosureUrls: string[]
  sourceUrls: string[] // the registration page(s) on the SoS website
  fetchedAt: Timestamp
}
```

The frontend doesn't read this collection directly: `compute_stats` rolls each
person's or entity's registrations into its `lobbyingMeta/firmSummaries` doc.

### Constructing `billId` from Raw Portal Data

The portal stores bill numbers as bare integers and records the chamber
separately. The `billId` field — which maps to `Bill.id` in MAPLE — is
constructed during ingest by combining chamber prefix and integer:

| `chamber`       | Prefix | Example raw | `billId` |
| --------------- | ------ | ----------- | -------- |
| `House Bill`    | `H`    | `1234`      | `H1234`  |
| `Senate Bill`   | `S`    | `1234`      | `S1234`  |
| `House Docket`  | `HD`   | `56`        | `HD56`   |
| `Senate Docket` | `SD`   | `56`        | `SD56`   |
| `Executive`     | —      | agency name | `null`   |
| `Other`         | —      | varies      | `null`   |

Note: `H1234` and `S1234` are distinct bills even though they share the same
integer. The prefix is required to disambiguate. `billId` is `null` for
non-legislative chambers.

#### Legacy chamber code normalization

The portal uses short-form codes in older filings, normalized during ingest:

| Raw value | Stored as     |
| --------- | ------------- |
| `HB`      | `House Bill`  |
| `SB`      | `Senate Bill` |

Rare codes (`FY`, `C`, `CMR`, `HR`, etc.) are stored as `Other`.

### Joining to Bill Data

**The join only applies to legislative chambers** (`House Bill`, `Senate Bill`,
`House Docket`, `Senate Docket`) where `billId` is non-null. For `Executive`
and `Other`, no join should be attempted.

```typescript
// Only valid when filing.billId !== null
db.collection(`/generalCourts/${filing.generalCourt}/bills`).doc(filing.billId)
```

---

## Entity Name Normalization

The portal does not enforce consistent name formatting. The same client or
registrant may appear as "Acme Corp.", "ACME CORPORATION", "Acme, Inc. d/b/a
Acme Consulting", etc. across filings and years. Without normalization,
grouping by entity is unreliable.

Both `entityName` and `clientName` are normalized using the following pipeline,
applied in order. The raw portal value is always preserved alongside the
normalized form.

### Normalization pipeline

1. **Uppercase** — convert the entire string to upper case.
2. **Strip d/b/a suffix** — remove everything from the first occurrence of
   `D/B/A`, `D/B/A`, `DBA` (and spacing variants) onward, so the registered
   name is used rather than a trade name.
3. **Hyphen → space** — replace `-` with ` ` so `LAN-TEL` and `LAN TEL`
   collapse to the same key.
4. **Punctuation → space** — replace `,`, `.`, `'`, `'`, `'`, `(`, `)` with
   space. Replacement with space (not empty string) prevents adjacent tokens
   from concatenating (e.g. `,INC` becomes ` INC`, which is then caught by step
   5).
5. **Remove legal entity type words** — whole-word removal of: `LLC`, `LLP`,
   `INC`, `INCORPORATED`, `CORPORATION`, `CORP`, `LTD`, `LIMITED`, `PC`,
   `PLLC`.
6. **Remove "THE"** — whole-word removal anywhere in the string (not just as a
   leading prefix).
7. **Ampersand → AND** — replace `&` with `AND` (spaced, so `A&B` and
   `A & B` match), and `ATTORNEY@LAW` with `ATTORNEY AT LAW`.
8. **Split glued suffix** — `XYZASSOCIATES` → `XYZ ASSOCIATES`.
9. **Fix known portal typos** — `ASSICIATES` → `ASSOCIATES`, `ATTORNET` →
   `ATTORNEY`.
10. **Remove descriptive phrases** — whole-word removal of: `LAW OFFICE OF`,
    `AND ASSOCIATES`, `AND ASSOC`, `ATTORNEY AT LAW`, `AND PARTNERS`, `PUBLIC
POLICY GROUP`, `LEGISLATIVE SERVICES`, `POLICY GROUP`, `ASSOCIATES`,
    `COUNSELLORS AT LAW`, so variants of one firm's name group together —
    **unless that would leave a single word**. A bare surname would merge
    different firms that share it (e.g. `X Associates`, `X Legislative
Services` and `X Policy Group`), so in that case the descriptor is kept
    (with `AND ASSOCIATES` shortened to `ASSOCIATES`).
11. **Collapse whitespace** — replace runs of whitespace with a single space and
    strip leading/trailing whitespace.

The implementation is `lobbying-scraper/normalize.py`.

### Usage

`entityNameNorm` and `clientNameNorm` are stored on every document and filing.
They should be used for grouping, deduplication, and display-level matching.
Raw names are preserved for provenance and audit.

---

## Deduplication and Amount Aggregation

### Does lobbying the same bill multiple times mean we should sum amounts?

The portal collects two semi-annual disclosure filings per registrant per year
(one for each 6-month period). In theory, a registrant could report the same
bill in both H1 and H2 filings with separate compensation amounts that should
be summed. Analysis of the actual data shows this does not occur: after
processing, zero rows share the same `(entityName, clientName, year,
generalCourt, billId, position)` — each (registrant, client, bill, year)
combination appears exactly once. The semi-annual periods report different
activity, not the same activity twice.

The same registrant can lobby the same bill across multiple General Courts
(observed up to 6 times across years). These are stored as separate documents
per `generalCourt` and should not be summed — each court is a distinct
legislative session.

### Null-bill row deduplication

The one real duplication artifact in the portal data is **null-bill rows** —
entries filed when a registrant had no specific bills to report for a client in
a period. These appear in both the H1 and H2 disclosures as identical rows and
should be collapsed. During ingest, if the same `(entityName, clientName, year,
generalCourt, chamber, position)` with a null `billId` is encountered more than
once, keep the row with the highest `amount` so no spend is lost if the two
copies carry different values (in practice amounts are usually both zero).

### Ingest strategy

When processing multiple disclosure URLs for the same registrant+year, write
`lobbyingFilings` documents using the logical key as the document ID. A
subsequent disclosure URL that produces the same document ID will naturally
upsert (overwrite) rather than duplicate. For null-bill rows, since `billId` is
null, include `chamber` in the document ID to avoid false merges between
executive and legislative null rows.

---

## Scraper Architecture

### Why a standalone Cloud Run container

The MA SoS portal is protected by Imperva WAF, which uses TLS fingerprinting to
classify HTTP clients at the network layer before examining any headers. Node.js
produces a TLS fingerprint that Imperva challenges with a JavaScript
verification page; Python's `requests` library produces a fingerprint that
Imperva allows through without challenge. This is a runtime-level constraint
that cannot be addressed by header configuration or cipher reordering alone.

The scraper therefore runs as a standalone **Cloud Run container** written in
Python, deployed alongside the existing MCP server container. All data modeling,
Firestore collection/field names, and normalization logic are documented here and
kept consistent between the Python container and the TypeScript type definitions
in `functions/src/lobbying/types.ts`.

### Cloud Run container: `lobbying-scraper/`

**Files:** `lobbying-scraper/{scrape,portal,normalize,writer}.py`

- Scheduled weekly by Cloud Scheduler
- Runs an incremental check: fetches the current and prior year's summary links
  (one POST), compares disc URLs against the Firestore cursor, and **exits
  immediately if nothing is new** (fast path, typically seconds)
- When new or updated disclosures are found, fetches and processes them
- Persists a cursor in `scrapers/lobbying`:
  - `processedDiscUrls: string[]` — disc URLs already written; skipped on
    re-runs
  - `summaryDiscCache: {[summaryUrl]: string[]}` — maps summary page URLs to
    their disc URLs so summary page GETs are skipped for prior-year registrants
    whose disclosures are all already processed
- For each new disclosure URL:
  - Parse registrant + client compensation rows → upsert `lobbyingRegistrants`
  - Parse bill activity rows → batch-write `lobbyingFilings`
- 1s delay between requests; exponential backoff on transient failures

### Incremental strategy

In steady state (after the initial backfill), each weekly run:

1. One POST to fetch all summary links for current + prior year
2. For prior-year registrants with all disc URLs in the cursor: zero GETs
3. For current-year registrants: one GET per summary page to check for new
   disclosure periods
4. For any new disc URLs: one GET per disclosure page

New filings arrive twice a year (semi-annual reporting periods). Between
periods, the run completes in under a minute.

The backfill script (`--mode backfill`) uses a separate subcollection cursor at
`scrapers/lobbyingBackfill/processedUrls/{urlHash}` so it does not interfere
with the live scraper state.

### Portal HTML format eras

The `CompleteDisclosure.aspx` page has changed layout several times. The parser
handles all four eras:

| Era      | Years        | Compensation source                                   | Notes                                                                                               |
| -------- | ------------ | ----------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Modern   | 2019–present | `grdvClientPaidToEntity` grid                         | Per-client rows; both employer and individual registrant variants                                   |
| Hybrid   | 2014–2018    | `Panel1_N` div blocks                                 | Compensation in collapsible panels; bill activity in a separate grid                                |
| Legacy B | 2009–2013    | "Compensation received" column in bill-activity table | Per-client amounts; deduplication required (same (client, amount) pair can appear in multiple rows) |
| Legacy A | 2005–2008    | `grdvSalaryPaid` entity-total row                     | No per-client breakdown; stored under sentinel `clientName: "_total_salary_"`                       |

Pre-2009 **individual** lobbyist summary pages link to `RegVersionLobbyist.aspx`
rather than `CompleteDisclosure.aspx`. These produce no disclosure detail and are
skipped — expected portal behavior. Employer/entity registrants use
`CompleteDisclosure.aspx` correctly across all years.

For Legacy A filings (2005–2008), `clientName: "_total_salary_"` signals to
callers that per-client compensation is unavailable. No bill-level compensation
amount is available for these years.

In the Modern and Hybrid eras each per-client activity block is headed by an
agent label (`lblLobbyistName_N`: "Lobbyist: X" from 2019, "Sub-agent: X" in
2014–2018), parsed into `clientLobbyists`. A firm's own block ("Entity: <firm>")
names no person and is skipped. The Legacy eras' "Lobbyist name" column holds
the firm (2009–2013) or several names run together (2005–2008), so those years
have no agents per client.

---

## New Files

```
functions/src/lobbying/
  types.ts     — Runtypes schema definitions for LobbyingRegistrant, LobbyingFiling
  index.ts     — Re-exports

lobbying-scraper/
  scrape.py           — Entry point: --mode weekly (incremental) | backfill | stats
  portal.py           — HTTP fetch wrappers + pure HTML parsers for all 4 format eras
  normalize.py        — Entity name normalization pipeline
  writer.py           — Firestore document construction + writes
  archive.py          — raw-HTML archive: GCS when ARCHIVE_RAW=1, or a local
                        folder when ARCHIVE_DIR is set (local runs only)
  reparse_archive.py  — Offline driver to re-ingest archived HTML into Firestore
  migrate_lobbying_data.py — Full rebuild of registrants and filings from the
                        archive; also the backfill path for newly parsed fields
  requirements.txt    — requests, beautifulsoup4, google-cloud-firestore, google-cloud-storage
  Dockerfile          — Python 3.12-slim image
```

The TypeScript lobbying module (`functions/src/lobbying/`) contains only the
schema types and normalization logic. There is no TypeScript scraper or
Firebase Function — ingestion is handled entirely by the Cloud Run container.
This follows the same pattern as the MCP server and avoids the complexity of
running multiple language runtimes in the same Firebase Functions deployment.

---

## Deploying the Cloud Run Container

`lobbying-scraper/deploy.sh` builds and pushes the image, creates or updates
the `maple-lobbying-scraper` Cloud Run job (with `ARCHIVE_RAW=1`), and creates
or updates the `maple-lobbying-weekly` Cloud Scheduler trigger (Mondays 06:00
UTC). The trigger runs as a dedicated `lobbying-scheduler` service account that
can only invoke the job. Run it once per project to set everything up:

```bash
gcloud auth configure-docker us-central1-docker.pkg.dev  # once
lobbying-scraper/deploy.sh <project>
```

The project's archive bucket (`<project>-lobbying-archive`) must already exist.
For a new project, run the historical backfill before the first weekly run.

After that, the [Deploy the lobbying scraper](../.github/workflows/deploy-lobbying-scraper.yml)
workflow keeps the image current: when a change under `lobbying-scraper/` is
pushed to `main` (dev) or `prod` (prod), it runs the scraper tests, builds and
pushes the image, and points the job at it. It doesn't change the job's
settings or schedule. It can also be run by hand from the Actions tab.

The job must not set `ARCHIVE_DIR`. That variable is for local runs: it keeps
the archive in a local folder and takes precedence over GCS. On Cloud Run that
folder is the container's temporary disk, so pages would be lost when the job
ends and the GCS archive would silently stop receiving them. `deploy.sh` only
sets `ARCHIVE_RAW=1`. To check a deployed job:

```bash
gcloud run jobs describe maple-lobbying-scraper --region=us-central1 \
  --project=<project> --format=yaml | grep -A1 "name: ARCHIVE_"
```

The output should show `ARCHIVE_RAW` and no `ARCHIVE_DIR`.

## Recomputing Stats

`lobbyingMeta` (overview stats, the Lobbyists and Clients lists, per-bill
summaries) is recomputed automatically at the end of any scraper run that
writes new data. To recompute it by hand from what's already in Firestore:

```bash
GOOGLE_CLOUD_PROJECT=<project> python3 scrape.py --mode stats
```

Besides the overview totals and the per-bill, client and firm summaries, it
writes the figures the Lobbying Explorer shows per session (shapes in
`functions/src/lobbying/types.ts` and `components/db/lobbying.ts`):

- `stats.courts[gc]`: bills and clients with filings, lobbyists and firms, and
  reported paid. Lobbyists and firms count those registered in the session and
  on a disclosure in it (as filer, or named by a firm). Paid is registrant
  compensation, as in `spendByYear`. `totalLobbyists` and `totalEntities` count
  the same way across all sessions. A bill is a chamber prefix and a number
  from 1 up, so H1 (the House budget) counts and H0/S0/HD0 don't: filers enter
  0 for activity on no bill yet ("N/A", "a bill to be filed next session").
  The portal's "No client" (a lobbyist's period with no client, "$0.00",
  activity usually "N/A", though some report bills) isn't an organization:
  it's left out of every client and organization count (session and total
  clients, a bill's organizations, a lobbyist's clients), but it has a client
  summary and list rows, marked `placeholder: true`, so the lobbyists who
  reported it can be listed. Its filings count toward bills' filings and its
  compensation toward reported paid. The pre-2009 total-salary row is left
  out of everything, summaries included.
- `billSummaries_{gc}/bills/{billId}`: `orgSupport`, `orgOppose`,
  `orgNeutral`, the distinct organizations per position (one with two
  positions counts in both); `orgLatestSupport`, `orgLatestOppose`,
  `orgLatestNeutral`, `orgLatestMultiple`, each organization counted once by
  the positions it reported in its latest half-year (more than one is
  "multiple"; one that reported only "none" isn't counted), the same counts as
  the Bill page, so they add up to the organizations with a position.
- `clientSummaries/clients/{id}`: per session, `bills`, `inHouseCount`,
  `individuals` (people lobbying for the client) and `firmAgents` (those who
  aren't its own staff: a hired firm's agents, or a hired individual
  lobbyist); `inHouseLobbyists` and `hiredFirms`, every lobbyist or entity
  on the client's disclosures, filings or agent blocks split into its own
  staff and those it hired, from one set so the two add up (a hired
  individual counts as a one-person firm; see Terminology); all-time
  counterparts of these (all-time `hiredFirms` leaves out anyone in-house in
  any session); per session, `firmsWithoutAgents` (hired firms that named no
  agents for the client, so `individuals + firmsWithoutAgents` is the people
  total) and `inHouseFilers` (the client's entry in `inHouseFilers_{gc}`);
  `firstRegistered` and `lastRegisteredYear` from
  registrations; `registrationUrl`, the client's own page on the SoS site from
  the latest year a registration links it (each registration listing a client
  links its page, a new one each year), else the latest registration listing
  the client.
- `inHouseFilers_{gc}`: `{clientNameNorm: [entityNameNorm]}`, the filers that
  are each client's own staff that session.
- `clientList_{gc}`, `clientList_all` and `firmList_{gc}`: one doc per session
  for the Clients and Lobbyists list pages, keyed by normalized name, holding
  what the lists show, sort and search on, so their API routes read one
  document instead of every summary. A lobbyist or entity is in a session's
  list when it registered in one of the session's years. There's no
  all-sessions lobbyist doc (about 2 MB, over Firestore's 1 MiB limit), so that
  view reads `firmSummaries`. The run logs each list doc's size and warns past
  900 KB: `clientList_all` was about 830 KB in October 2026 and grows with
  every new client.

A filer is in-house for a client when it is the client, or when its
registration for that session names the client as its employer (from 2019),
or, for an individual registered with no employing entity, lists the client
as a client. Lobbyists working for a firm register under it and list no
clients, and an individual account may have at most one client (see
Terminology), which is how organizations that don't register as entities
register their own staff (e.g. the Greater Boston Chamber of Commerce's). This
last case holds before 2019 too, so older sessions have a split. Its one known
error: that single client may instead have contracted the lobbyist, and neither
the portal nor the data says which, so a single-client contractor counts as
in-house. Independent lobbyists with more than one client register as entities
and count as hired.

Firms name their agents per client from 2014 (no firm disclosure before 2014
carries the label), so `individuals` and `firmAgents` include firm agents from
the 189th session (2015–16) on, and the 188th (2013–14) for 2014 only. Before
that they count only individual filers. The frontend shows them from the 189th
on, and before it (and for all sessions) counts lobbyists and firms instead,
`inHouseLobbyists + hiredFirms`, so no session's count silently misses a year
of firm agents.

The run ends by logging, per year, how many filings have `periodEnd` and how
many firm disclosures name agents per client, and each `inHouseFilers_{gc}`
doc's size. A drop in either coverage count means the parser stopped reading
that field.

## Historical Backfill

Runs `scrape.py --mode backfill` directly. Resumable — the subcollection
cursor at `scrapers/lobbyingBackfill/processedUrls` tracks progress.

Always set `ARCHIVE_RAW=1` for real runs so every fetched page is preserved
for offline reparsing. Create the GCS archive bucket first if it does not
exist (see Step 7 of the test plan).

```bash
cd lobbying-scraper

# Test a single year with no writes
GOOGLE_CLOUD_PROJECT=digital-testimony-dev \
  GOOGLE_APPLICATION_CREDENTIALS=~/.config/gcloud/application_default_credentials.json \
  python3 scrape.py --mode backfill --year 2024 --limit 3 --dry-run

# Run a single year for real (with archiving)
GOOGLE_CLOUD_PROJECT=digital-testimony-dev \
  GOOGLE_APPLICATION_CREDENTIALS=~/.config/gcloud/application_default_credentials.json \
  ARCHIVE_RAW=1 \
  python3 scrape.py --mode backfill --year 2024

# Full history (2005–present, resumable, with archiving)
GOOGLE_CLOUD_PROJECT=digital-testimony-dev \
  GOOGLE_APPLICATION_CREDENTIALS=~/.config/gcloud/application_default_credentials.json \
  ARCHIVE_RAW=1 \
  python3 scrape.py --mode backfill
```

## Backfilling Newly Parsed Fields

When the parser learns to read a new field (e.g. filing `periodEnd`, registrant
`clientLobbyists`, a client's own registration page) or skips something it used
to keep (superseded versions of amended disclosures), new disclosures get the
change from the weekly run, but existing docs only get it by reparsing the
archive. Use `migrate_lobbying_data.py`, in this order:

```bash
cd lobbying-scraper
export GOOGLE_APPLICATION_CREDENTIALS=...
M="python3 migrate_lobbying_data.py --project <project> --out-prefix /tmp/<project>"
# 1. Re-fetch archived pages that aren't the real page (the portal's error
#    page, or its Incapsula block page): dry run, then --execute.
$M --phase refetch-errors
$M --phase refetch-errors --execute
# 2. Rewrite every registrant and filing doc from the archived disclosures;
#    superseded versions are skipped (expect "superseded" > 0 and
#    superseded_without_current 0).
$M --phase write
# 3. Rewrite every registration doc from the archived registration pages
#    (e.g. clients' own pages, for registrationUrl).
$M --phase registrations
# 4. Docs the write phase no longer produces: dry runs first; each prints the
#    exact --execute command (with --expect-ids/--expect-stale) to run after.
$M --phase cleanup --collection filings
$M --phase cleanup --collection registrants
# 5. Check that every filing has its period: filings from disclosures missing
#    from the archive weren't rewritten. Expect "updated" 0 in the dry run;
#    otherwise --execute copies each one's period from its registrant doc.
$M --phase filing-periods
# 6. Recompute lobbyingMeta.
GOOGLE_CLOUD_PROJECT=<project> python3 scrape.py --mode stats
```

Read the cleanup dry runs before running them with `--execute`. Stale filings
are expected when the write phase skips something it used to keep: the
filings of superseded versions of amended disclosures (977 for 2008–2026 in
the October 2026 local rebuild). Anything else stale means doc ids changed:
stop and find out why. Don't use `reparse_archive.py` for this: it skips pages
an earlier reparse already marked processed. Docs from disclosures missing from
the archive keep the field absent.

The `filing-periods` phase copies each disclosure's period from its registrant
doc onto filings that lack one, without reparsing. After the write phase it
only reaches filings whose disclosure isn't in the archive, which is why step 5
runs it as a check.

For a given deploy, the issue that ships it lists the steps and spot checks
(e.g. hyphacoop/maple#106).

## Running the Scraper Locally

Verify scraper changes with a full local scrape before deploying: the live SoS
portal into the Firestore emulator, with a local archive of every fetched page.
Nothing touches GCP (no credentials, no GCS, no dev project).

### 1. A folder that survives reboots

Keep the archive and emulator data outside `/tmp`, e.g.
`~/.local/share/maple-lobbying`. The emulator also needs the repo's config
files there:

```bash
DATA=~/.local/share/maple-lobbying
mkdir -p $DATA/logs
cp firebase.json firestore.rules firestore.indexes.json $DATA/
```

### 2. The Firestore emulator

`firebase-tools` needs Java 21 or later. Without a local JDK, run it in Docker
from an image with Node 22 and a Java 21 runtime:

```bash
docker build -t maple-firestore-emulator - <<'EOF'
FROM node:22-bookworm-slim
COPY --from=eclipse-temurin:21-jre /opt/java/openjdk /opt/java/openjdk
ENV JAVA_HOME=/opt/java/openjdk PATH=/opt/java/openjdk/bin:$PATH
RUN npm install -g firebase-tools@15.32.0
WORKDIR /repo
EOF

docker run -d --name maple-emulator --network host \
  --user $(id -u):$(id -g) -e HOME=/tmp -v $DATA:/repo \
  maple-firestore-emulator firebase --project demo-dtp \
  emulators:start --only firestore --export-on-exit /repo/emulator-data
```

Add `--import /repo/emulator-data` once that folder exists (the first start
has nothing to import). The emulator keeps everything in memory: it exports on
a clean stop (`docker stop maple-emulator`), but a crash or reboot loses
everything since the last export. During a long run, export now and then:

```bash
docker exec maple-emulator firebase emulators:export /repo/emulator-data \
  --project demo-dtp --force
```

Keep the machine from sleeping during a run: a suspend drops the network, and
the run stalls until it wakes.

### 3. The scrape

```bash
cd lobbying-scraper
python -m venv .venv && . .venv/bin/activate
pip install -r requirements.txt
# DATA must be set in this shell (step 1): an empty ARCHIVE_DIR silently turns
# the local archive off. This stops here if it isn't.
: "${DATA:?set DATA to the data folder first}"
export FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 GOOGLE_CLOUD_PROJECT=demo-dtp \
  ARCHIVE_DIR=$DATA PYTHONUNBUFFERED=1
# ARCHIVE_DIR takes precedence, so ARCHIVE_RAW does nothing while it's set.
# Unset anyway: if ARCHIVE_DIR ended up empty, a leftover ARCHIVE_RAW=1 (e.g.
# from the Historical Backfill commands) would switch on GCS archiving instead.
unset GOOGLE_APPLICATION_CREDENTIALS ARCHIVE_RAW

# Smoke test: a few registrants, then stats (a --limit run skips stats).
python scrape.py --mode backfill --year 2016 --limit 5 --use-archive
python scrape.py --mode stats

# Full history, all years.
python scrape.py --mode backfill --use-archive --workers 8 >> $DATA/logs/scrape.log 2>&1
```

`ARCHIVE_DIR` saves every fetched page to `$DATA/raw_html/` (the page as
`<sha1 of url>.html`, its URL in a matching `.url` file), and `--use-archive`
reads pages from there before going to the portal. The backfill records each
processed disclosure in the emulator, so a stopped run resumes where it left
off.

What a full run took in October 2026, with 8 workers: about 47,000
disclosures and 593,000 filings in roughly 6 hours of fetching, then about 20
minutes for stats, with the emulator using about 11 GB of memory. The archive
was 12 GB and the emulator export 640 MB. Speed depends on the portal: an
earlier attempt during the day ran about 20 times slower, with read timeouts.
Progress lines carry UTC timestamps, so the log shows when a run slowed down.

### 4. Rebuilding from the archive

After a parser change, rebuild without the portal: start a second, empty
emulator (or stop this one and start it without `--import`), then rerun the
backfill with `ARCHIVE_DIR` and `--use-archive`. Pages come from disk; only the
search that lists each year's registrants, and any page missing from the
archive, are fetched live. Pages are missing when their disclosure was
processed before archiving was turned on, since the backfill skips processed
disclosures and never fetches them again.

To rebuild in place, export first and keep a copy outside `emulator-data`
(e.g. `emulator-data.pre-rebuild`), since `--export-on-exit` and any snapshot
job overwrite `emulator-data`. Pages fetched live may hit the portal's bot
protection: the scraper retries a block page with backoff, never archives or
parses it, and leaves the disclosure unprocessed if the block outlasts the
retries, so rerunning the backfill for that year picks it up.

### 5. Looking at the data

The emulator UI is at `http://127.0.0.1:3010/firestore` (with this repo's
`firebase.json`). It can't open documents whose ID contains `%`, which
includes every client and firm summary (their IDs are `encodeURIComponent` of
the name). Read those through the emulator's REST API instead, with each `%`
encoded again as `%25`, e.g.:

```
http://127.0.0.1:8080/v1/projects/demo-dtp/databases/(default)/documents/lobbyingMeta/clientSummaries/clients/GREATER%2520BOSTON%2520CHAMBER%2520OF%2520COMMERCE
```

To see a page as the portal served it, open its file in `$DATA/raw_html/`.

---

## Firestore Rules

Add read-only public rules alongside the existing `generalCourts` rule:

```
match /lobbyingRegistrants/{doc} { allow read: if true; }
match /lobbyingFilings/{doc}     { allow read: if true; }
```

---

## Firestore Indexes

Add composite indexes for common query patterns:

| Collection        | Fields                                 | Use case                                 |
| ----------------- | -------------------------------------- | ---------------------------------------- |
| `lobbyingFilings` | `generalCourt ASC, billId ASC`         | Fetch all legislative filings for a bill |
| `lobbyingFilings` | `generalCourt ASC, chamber ASC`        | Filter by chamber within a court         |
| `lobbyingFilings` | `generalCourt ASC, entityNameNorm ASC` | Fetch all filings for a registrant       |
| `lobbyingFilings` | `generalCourt ASC, clientNameNorm ASC` | Fetch all filings for a client           |

Note: bill-join queries should always filter on `chamber` (or check
`billId !== null`) to exclude `Executive` and `Other` rows before treating
`billId` as a MAPLE bill reference.

---

## Implementation Status

| File                                  | Status     | Notes                                                            |
| ------------------------------------- | ---------- | ---------------------------------------------------------------- |
| `functions/src/lobbying/types.ts`     | ✅ Done    | Firestore schema types; imported by future frontend code         |
| `functions/src/lobbying/index.ts`     | ✅ Done    | Re-exports types                                                 |
| `firestore.rules`                     | ✅ Done    |                                                                  |
| `firestore.indexes.json`              | ✅ Done    |                                                                  |
| `lobbying-scraper/normalize.py`       | ✅ Done    | Entity name normalization pipeline                               |
| `lobbying-scraper/portal.py`          | ✅ Done    | All 4 format eras; pure parsers separated from fetch wrappers    |
| `lobbying-scraper/writer.py`          | ✅ Done    | Firestore document construction                                  |
| `lobbying-scraper/scrape.py`          | ✅ Done    | Entry point; `--mode weekly` and `--mode backfill`               |
| `lobbying-scraper/archive.py`         | ✅ Done    | GCS write-only archive; enabled via `ARCHIVE_RAW=1`              |
| `lobbying-scraper/reparse_archive.py` | ✅ Done    | Offline reparse driver; looks up registrant meta from Firestore  |
| `lobbying-scraper/Dockerfile`         | ⚠️ Rebuild | Needs rebuild after `google-cloud-storage` added to requirements |

### Document ID scheme

Both `registrantId` and `filingId` are SHA-256 hashes (first 40 hex chars) of
their respective logical keys. Hashes are used rather than slugified strings
because entity names and client names contain arbitrary Unicode and punctuation
that would require aggressive sanitization to fit Firestore ID constraints. The
hash is stable across runs for the same logical record.

---

## Future Work (Subsequent PRs)

### Frontend

- **Dedicated lobbying pages**

  - `/lobbyists` index: searchable list of registrants with total compensation,
    client count, and year filter
  - `/lobbyists/{registrantId}` profile: full client list, all bills lobbied,
    compensation over time
  - `/clients/{clientNameNorm}` profile: registrants hired, bills lobbied,
    total spend per year

- **Bill page integration** (`/bills/{court}/{billId}`)

  - "Lobbying activity" section listing registrants + clients that lobbied this
    bill, with position (Support / Oppose / Neutral) and compensation where
    available
  - Link to registrant profile pages

- **Organization profile page integration**
  - If an organization's normalized name matches a `clientNameNorm` in
    `lobbyingFilings`, surface a "Lobbying history" panel showing which bills
    they lobbied and which registrants they hired

### MCP Tools

Expose lobbying data via the MAPLE MCP server so that AI agents and Claude can
answer questions like "who lobbied bill H1234?" or "what did Acme Corp lobby
for in 2024?".

- **`get_lobbying_filings_for_bill`** — given `generalCourt` + `billId`, return
  all `lobbyingFilings` for that bill with registrant, client, position, and
  amount
- **`get_lobbying_registrant`** — given `registrantId`, return the registrant
  document with client list and disclosure URLs
- **`search_lobbying_by_client`** — given a client name (raw or normalized),
  return matching filings across all courts
- **`get_lobbying_summary_for_bill`** — aggregate view: unique registrant count,
  unique client count, total compensation (where non-null), position breakdown

---

## Incremental Test Plan

Testing proceeds from the inside out: unit logic first, then live portal
fetches against the real site, then a small Firestore write, then a full
backfill year, then steady-state function operation.

### Step 1 — Unit tests: parser, normalization, bill construction

Run the pytest suite against all 4 HTML format eras using committed fixture
pages:

```bash
cd lobbying-scraper
python -m pytest tests/ -v
```

CI runs this suite on every push. Covers compensation totals and client/bill counts for
all eras (2007, 2011, 2016, 2024 — employer and individual), normalization edge
cases, bill ID construction, and specific bug regressions (semicolon bill
separator, "Total amount" artifact row, null billId for executive rows).

### Step 2 — Live portal fetch: dry run

Verify the portal is reachable and the parser returns valid data without writing
to Firestore:

```bash
cd lobbying-scraper
GOOGLE_CLOUD_PROJECT=digital-testimony-dev \
  GOOGLE_APPLICATION_CREDENTIALS=~/.config/gcloud/application_default_credentials.json \
  python3 scrape.py --mode backfill --year 2024 --limit 3 --dry-run
```

Expected: 3 registrants fetched, compensation and bill rows printed, no
Firestore writes.

### Step 3 — Firestore write: single year, small limit

Write a small batch to the dev project and verify results:

```bash
cd lobbying-scraper
GOOGLE_CLOUD_PROJECT=digital-testimony-dev \
  GOOGLE_APPLICATION_CREDENTIALS=~/.config/gcloud/application_default_credentials.json \
  python3 scrape.py --mode backfill --year 2024 --limit 3
```

Verify in Firestore console:

- `lobbyingRegistrants` has 3 documents with `entityName`, `entityNameNorm`,
  `regType`, `clients`, `generalCourt`
- `lobbyingFilings` has documents with `billId` non-null for legislative rows
  and `null` for Executive rows
- `scrapers/lobbyingBackfill/processedUrls` has entries with `url` and
  `processedAt` fields
- Re-running skips already-processed URLs (output shows 0 new disclosures)

### Step 4 — Spot-check: bill join

Pick a `lobbyingFiling` document with a non-null `billId` and a `generalCourt`
≥ 192. Verify the bill exists in MAPLE:

```
/generalCourts/{filing.generalCourt}/bills/{filing.billId}
```

If the bill is found, the join key is correct. If not found, check: (a) whether
MAPLE has data for that court, (b) whether the bill number format matches
(prefix + integer, no leading zeros).

### Step 5 — Create GCS archive bucket (once per project)

The archive bucket name is derived from `GOOGLE_CLOUD_PROJECT`. Create it once
with the Archive storage class (written once, read rarely):

```bash
gsutil mb -p digital-testimony-dev -l us-central1 \
  -c archive gs://digital-testimony-dev-lobbying-archive
```

Repeat for prod when running the prod backfill:

```bash
gsutil mb -p digital-testimony-prod -l us-central1 \
  -c archive gs://digital-testimony-prod-lobbying-archive
```

Each project uses its own bucket. Dev and prod data are isolated; the Cloud Run
service account for each project only needs access to its own bucket.

### Step 6 — Backfill: full current year (or partial across all years)

Always run with `ARCHIVE_RAW=1` so every fetched page is preserved for offline
reparsing. For a large-scale dev test before a full prod run, `--limit N` is
applied per year — e.g. `--limit 50` across all years fetches ~10% of history:

```bash
cd lobbying-scraper

# Full current year
GOOGLE_CLOUD_PROJECT=digital-testimony-dev \
  GOOGLE_APPLICATION_CREDENTIALS=~/.config/gcloud/application_default_credentials.json \
  ARCHIVE_RAW=1 \
  python3 scrape.py --mode backfill --year 2024

# ~10% partial across all years (good large-scale dev validation)
GOOGLE_CLOUD_PROJECT=digital-testimony-dev \
  GOOGLE_APPLICATION_CREDENTIALS=~/.config/gcloud/application_default_credentials.json \
  ARCHIVE_RAW=1 \
  python3 scrape.py --mode backfill --limit 50
```

Expected for full year: ~500–600 registrants, ~1,000 disclosure pages, several
thousand filing documents written.

### Step 7 — Backfill: full history (2005–present)

Run without `--year` to process all years. Can be interrupted and resumed:

```bash
GOOGLE_CLOUD_PROJECT=digital-testimony-dev \
  GOOGLE_APPLICATION_CREDENTIALS=~/.config/gcloud/application_default_credentials.json \
  ARCHIVE_RAW=1 \
  python3 scrape.py --mode backfill
```

Expected runtime: several hours at ~1s/request. The subcollection cursor at
`scrapers/lobbyingBackfill/processedUrls` allows safe interruption and
resumption.

### Step 8 — Deploy and verify Cloud Run scraper

Build, push and schedule the job (see
[Deploying the Cloud Run Container](#deploying-the-cloud-run-container)):

```bash
lobbying-scraper/deploy.sh digital-testimony-dev
```

Trigger a manual run via the Cloud Run console or:

```bash
gcloud run jobs execute maple-lobbying-scraper \
  --project=digital-testimony-dev \
  --region=us-central1
```

Verify via Cloud Run logs: the run should find near-zero new disclosures if the
backfill already completed, confirming the weekly fast-path works correctly.

---

## Design Decisions

| Decision                    | Choice                                                                       | Rationale                                                                                                                                                                |
| --------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Collection placement        | Top-level `/lobbyingRegistrants`, `/lobbyingFilings`                         | Lobbying data spans multiple General Courts and is not scoped to a single court like bills/members                                                                       |
| Single registrant model     | One type, `regType: "Lobbyist" \| "Employer"`                                | Individual lobbyists and firms share the same portal schema; agents are stored per client (`clientLobbyists`, 2014+), not per bill                                       |
| `billId` construction       | `{chamberPrefix}{billNumber}` at ingest time                                 | Raw portal data stores chamber and integer separately; the composite is what matches MAPLE's `Bill.id`                                                                   |
| `billId` null for Executive | `null` instead of agency name                                                | Prevents accidental bill lookups; makes join guard explicit at the type level                                                                                            |
| Normalized name fields      | Store both raw and `*Norm` fields                                            | Raw names preserved for provenance; normalized names used for grouping and matching                                                                                      |
| HTML parser                 | `beautifulsoup4` (Python)                                                    | Runs in the Cloud Run container alongside the scraper; no JavaScript runtime needed                                                                                      |
| Live scraper cursor         | Array in `/scrapers/lobbying` doc                                            | ~1,000 URLs/year fits well within the 1 MB Firestore doc limit; simple and atomic with other scraper state                                                               |
| Backfill cursor             | Firestore subcollection `/scrapers/lobbyingBackfill/processedUrls/{urlHash}` | Full 2005-present history (~50,000 URLs) would exceed the 1 MB doc limit; subcollection scales without bound and is durable, inspectable, and resumable from any machine |
| Incremental strategy        | Skip already-processed disclosure URLs; write docs by logical key (upsert)   | Survives function restarts and re-runs without re-fetching already-scraped pages; natural upsert prevents duplicates without an explicit dedup pass                      |
| Legacy format (pre-2013)    | Store with `clientName: "_total_salary_"` sentinel                           | Preserves data completeness; callers can filter on this value                                                                                                            |
| Historical data             | Admin backfill script (2005 → present)                                       | Full history is ingested once; Cloud Function maintains current+prior year going forward                                                                                 |

---

## Appendix: Phase 2 — OCPF Contribution Ingestion

This appendix tracks planned additions to the lobbying pipeline in a subsequent
PR. The changes link OCPF (Office of Campaign and Political Finance) campaign
contribution records to lobbying registrants, enabling questions like "how much
did this firm contribute to politicians while lobbying on this bill?"

### Background

The MA Secretary of State portal (Phase 1, implemented) covers who lobbied which
bills and for how much compensation. OCPF covers who donated to which political
candidates. Linking the two surfaces the intersection: lobbying firms that also
made political contributions.

OCPF publishes bulk data files at
`ocpf2.blob.core.windows.net/downloads/data2/` (the same host used by
`matchOcpfMembers.ts` for the filers file). The contribution records file URL
needs to be confirmed before implementation begins.

### New Data

#### `/lobbyingContributionRecipients/{recipientId}`

One document per deduplicated contribution recipient (politician/PAC). The
deduplication pipeline is described below.

```typescript
interface LobbyingContributionRecipient {
  recipientId: string // SHA-256(recipientName + officeSought)[:40]
  recipientName: string // canonical display name after dedup
  recipientSlug: string // slugify("{recipientName} {officeSought}")
  officeSought: string // canonical office value (see normalization below)
  totalReceived: number
  nContributions: number
  years: number[]
  nameVariants: string[] // all raw names that resolved to this record
  manuallyMerged: boolean // true if recipient_merges.json was applied
  topFirms: [string, string, number][] // [entityName, entityNameNorm, amount]
  fetchedAt: Timestamp
}
```

#### New fields on `LobbyingRegistrant` (optional, written by contribution run)

```typescript
nBills?: number             // total filing rows across all clients and years
nContributions?: number     // total OCPF contribution records from this registrant
totalContributions?: number // total dollar amount contributed
```

`nBills` is computed during the disclosure scrape (bill rows are already in
memory) and written as a side effect of `--mode weekly` and `--mode backfill`.
`nContributions` and `totalContributions` are written by `--mode contributions`.

#### Pure-contribution firms (new registrant subtype)

Firms that made OCPF contributions but have zero lobbying activity (no filings)
are written as `LobbyingRegistrant` documents with `nBills: 0`, `clients: []`,
`totalContributions ≥ 500`. These were previously invisible. The $500 threshold
filters noise; adjust after reviewing the data.

### Contribution Recipient Deduplication

The same politician may appear under many name variants in OCPF data ("Joe
Curtatone", "Joseph Curtatone", "Curtatone"). The dedup pipeline runs in five
passes in-memory after loading all contribution records.

All rules are systemic (handle a class of inputs); individual special cases are
handled via `recipient_merges.json` only.

#### New file: `lobbying-scraper/recipient_normalize.py`

**Step 1 — `_extract_recipient_name(raw)`**

Strips committee wrapper names using 14 regex patterns (e.g. "Cte. to Elect Ron
Mariano" → "Ron Mariano"). Then applies in order:

- Last-first flip: `"Mariano, Ronald"` → `"Ronald Mariano"`
- Honorific strip: `"Sen. Marc Rodrigues"` → `"Marc Rodrigues"`
- Party label strip: `"Ron Mariano Democrat"` → `"Ron Mariano"`
- Initial-dot prefix strip: `"R.Mariano"` → `"Mariano"`

**Step 2 — `_recipient_dedup_key(name, office)` → `(first, last, office)`**

Key is a `(first_token, last_token, canonical_office)` tuple. Before keying,
`first_token` is passed through `_NICKNAME_MAP`:

| Raw              | Canonical |
| ---------------- | --------- |
| joe              | joseph    |
| mike             | michael   |
| bob              | robert    |
| bill             | william   |
| jim              | james     |
| tom              | thomas    |
| dan              | daniel    |
| dave             | david     |
| steve            | steven    |
| ron              | ronald    |
| tim              | timothy   |
| rick, rich, dick | richard   |
| charlie, chuck   | charles   |
| ben              | benjamin  |
| tony             | anthony   |
| marty            | martin    |
| don              | donald    |
| ken              | kenneth   |
| ed               | edward    |
| ray              | raymond   |
| nick             | nicholas  |

If either token is a generic word (`the`, `comm`, `committee`, `democratic`,
`republican`, `house`, `senate`, `friends`, `cte`, `pac`), the key falls back
to the full canonical text.

**Step 3 — Manual merges (`recipient_merges.json`)**

JSON file maps `(name, office)` alias pairs to a canonical record. Start as an
empty object `{}`; populate incrementally as data review finds misses. Applied
after key assignment.

**Step 4 — `_merge_bare_surnames(groups)`**

Single-name entries where `first == last` (e.g. `"Curtatone"`) are merged into
the highest-total multi-token peer with the same `(last, office)`.

**Step 5 — `_fuzzy_merge_keys(groups)`**

Groups keys by `(first, office)`. Pairs where last tokens differ by Levenshtein
distance ≤ 1 are merged into the higher-total key. Minimum 6 chars on both last
tokens (protects short surnames: Walsh, Jones, etc.).

### Office Normalization — `_normalize_office(raw)` in `recipient_normalize.py`

Canonical office values:

`State Representative` · `State Senator` · `Governor` · `Lt. Governor` ·
`Attorney General` · `Treasurer` · `Auditor` · `Secretary of State` · `Mayor` ·
`City Council` · `District Attorney` · `Sheriff` · `PAC`

Normalization pipeline (applied in order):

1. Strip `"Candidate for [Massachusetts] X"` prefix → `"X"`
2. Strip leading `MA` / `Mass.` / `Massachusetts`
3. Strip trailing junk punctuation (`:;/`)
4. Strip parenthetical suffixes
5. Strip `"of the …"` / `"from the …"` suffixes
6. Strip after dash or slash
7. Strip after comma
8. Strip ordinal suffixes (e.g. `" 3rd Norfolk …"`)
9. Re-strip trailing junk (ordinal strip can leave dangling colons)
10. `OFFICE_MAP` lookup (canonical string → canonical value)
11. Fallback — district lookup: ordinal + MA county → `State Representative`
12. Fallback — county suffix: `"Representative Suffolk"` → strip county → retry map
13. Fallback — location qualifier: strip `"of <city>"`, trailing word, or leading
    word → retry map (handles `"Mayor of Somerville"`, `"Somerville Mayor"`,
    `"Mayor Somerville"` → `"Mayor"`)

### New Files

```
lobbying-scraper/
  ocpf_contributions.py   — OCPF bulk data download, parse, match to registrants
  recipient_normalize.py  — office normalization + 5-step recipient dedup pipeline
  recipient_merges.json   — manual merge overrides (start as {})
```

### Infrastructure Changes

**`firestore.rules`** — add:

```
match /lobbyingContributionRecipients/{id} { allow read: if true; allow write: if false; }
```

**`firestore.indexes.json`** — add:

| Collection                       | Fields                                 | Use case                    |
| -------------------------------- | -------------------------------------- | --------------------------- |
| `lobbyingContributionRecipients` | `officeSought ASC, totalReceived DESC` | Office-filtered leaderboard |
| `lobbyingContributionRecipients` | `officeSought ASC, recipientName ASC`  | Alphabetical browse         |

### What Is Not Implemented (Phase 2)

**AI bill topics (`tags.json` equivalent)** — requires a bill embeddings parquet
file. MAPLE does not produce this file. The topics feature is deferred; MAPLE's
existing bill search index could be used as a substitute in a future PR.

**`recipient_merges.json`** — starts empty. Requires domain review of the
deduplicated output to find cases the automated rules miss. Populate
incrementally.

### Order of Work

1. Confirm OCPF bulk contribution file URL and column schema
2. Confirm or incorporate HTML archiving pattern (see open question below)
3. Implement `recipient_normalize.py` (self-contained, testable in isolation)
4. Implement `ocpf_contributions.py`
5. Update `functions/src/lobbying/types.ts` schema
6. Update `writer.py` and `scrape.py`
7. Update `firestore.rules` and `firestore.indexes.json`

### HTML Archiving for Fast Reparsing

The current scraper fetches and immediately parses SoS portal HTML, storing
nothing but the parsed Firestore documents. If parsing logic changes, the full
portal must be re-scraped — slow and fragile given the Imperva TLS constraint.
Phase 2 adds GCS archiving of raw HTML as a side effect of every portal fetch.

#### Design principles

The archive is **write-only cold storage**, not a cache. It is fully decoupled
from both the incremental cursor (which stays Firestore-only) and the parse
path. Fetching from the portal is always driven by the Firestore cursor; the
archive is a downstream side effect of a successful fetch.

Parsers must be **pure functions with no I/O** — `parse_summary(soup)`,
`parse_disclosure_detail(soup, year)` — so the identical code runs in the live
scrape and in the offline reparse script without modification.

#### GCS key scheme

One object per fetched page: `raw_html/{sha1(url)}.html`. URL-hash is
collision-free without modeling the ASP.NET URL key space. Individual `.html`
objects (not batch tarballs) are appropriate here because our scraper runs
weekly in small increments rather than in large historical sweeps; per-object
GCS is simpler and makes the reparse path a flat list + get.

Bucket: `gs://<project>-lobbying-archive/raw_html/`
Storage class: Archive (written once, read rarely).

#### Write timing

Archived immediately after `raise_for_status()` passes, before parsing, and
**not gated on parse success**:

```python
def _get(session, url):
    r = session.get(url, ...)
    r.raise_for_status()
    if "Summary.aspx" in url or "CompleteDisclosure" in url:
        _archive_page(url, r.text)   # side effect; never blocks parse
    return BeautifulSoup(r.text, "html.parser")
```

Gating on parse success would defeat the purpose: the archive exists precisely
to recover from parser gaps later, so we want the bytes even when the current
parser does not fully understand them. The search/results page is excluded
(same URL across all years, trivially regenerable).

#### Reparse path

A dedicated offline script `lobbying-scraper/reparse_archive.py`:

```
python3 reparse_archive.py [--limit N] [--dry-run]
```

Lists `raw_html/*.html` objects from GCS, downloads them, resolves each
`sha1.html` back to its original URL (stored as object metadata at write time),
and runs the pure parser functions against the archived soup. Marks each
completed object with GCS metadata (`reparse-processed=true`) so reparse is
resumable; it never revisits a marked object, so use
`migrate_lobbying_data.py` to backfill a newly parsed field.

#### Cursor interaction

No change to the Firestore cursor. The archive is never consulted to skip a
portal fetch. "Have I processed this disclosure?" is still answered by the
Firestore cursor; the archive is a consequence of fetching, not an input to the
decision.

#### New infrastructure required

- GCS bucket `<project>-lobbying-archive` (Archive class, no public access)
- `google-cloud-storage` added to `lobbying-scraper/requirements.txt`
- `GOOGLE_CLOUD_PROJECT` env var (already available on Cloud Run) used to
  derive bucket name
- IAM: Cloud Run service account needs `storage.objects.create` on the bucket
- New file: `lobbying-scraper/reparse_archive.py`

#### Order of work within Phase 2

This is a prerequisite for `ocpf_contributions.py` only in the sense that we
want the archive in place before running the full historical backfill so we do
not have to re-scrape. It is otherwise independent and can be implemented
alongside the contribution pipeline rather than before it.
