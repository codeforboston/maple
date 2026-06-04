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
   filings
3. **CompleteDisclosure page** → per-client compensation table + per-client bill
   activity tables

Historical data goes back to 2005. MAPLE has bill data only from ~2020 onward,
so bill joins will only resolve for filings from the 192nd General Court (2021)
and later. All historical filings are ingested regardless.

---

## Terminology

The portal has two registrant types:

- **Lobbyist** — an individual person who lobbies directly on behalf of clients.
- **Employer** — a lobbying firm that employs individual lobbyists and is
  retained by clients. Called "Lobbyist Entity" on the portal.

In both cases, the registrant reports compensation received from each **client**
(the organization that hired them) and which bills they lobbied for that client.

---

## Firestore Data Model

Two top-level collections, normalized by registrant and by lobbying activity
record.

### `/lobbyingRegistrants/{registrantId}`

`registrantId` is a slugified `{entityName}_{year}` (stable, dedup-safe).

One model covers both individual lobbyists and lobbying firms. A separate model
is not needed because the portal search returns both under the same schema, and
per-filing detail pages do not expose which individual lobbyists within a firm
worked on which bill.

```typescript
interface LobbyingRegistrant {
  registrantId: string // "{entityName}_{year}" slugified
  entityName: string // firm name or individual lobbyist name (raw portal value)
  entityNameNorm: string // normalized form; see Normalization section
  year: number
  generalCourt: number // computed from year
  regType: "Lobbyist" | "Employer"
  clients: LobbyingClient[]
  disclosureUrls: string[] // source portal URLs, for audit trail
  fetchedAt: Timestamp
}

interface LobbyingClient {
  clientName: string
  clientNameNorm: string // normalized form
  compensation: number | null
}
```

### `/lobbyingFilings/{filingId}`

`filingId` is a slugified
`{entityName}_{clientName}_{chamber}_{activityRef}_{generalCourt}`.

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
  fetchedAt: Timestamp
}
```

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
7. **Ampersand → AND** — replace `&` with `AND`.
8. **Fix known typo** — replace `ASSICIATES` with `ASSOCIATES` (legacy portal
   data).
9. **Remove professional suffix phrases** — whole-phrase removal of: `LAW
OFFICE OF`, `AND ASSOCIATES`, `& ASSOCIATES`, `AND ASSOC`, `ATTORNEY AT
LAW`, `ATTORNEY@LAW`, `ATTORNET AT LAW`, `AND PARTNERS`, `PUBLIC POLICY
GROUP`, `LEGISLATIVE SERVICES`, `POLICY GROUP`, `ASSOCIATES`, `COUNSELLORS
AT LAW`.
10. **Collapse whitespace** — replace runs of whitespace with a single space and
    strip leading/trailing whitespace.

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

The lobbying portal is an HTML scraper, not a REST API. It does not fit the
`createScraper` factory (which assumes list-IDs → fetch-per-ID against the MA
Legislature API). Instead, we use a custom scheduled function following the
`scrapeEvents` pattern.

### Cloud Function: `scrapeLobbying`

**File:** `functions/src/lobbying/scrapeLobbying.ts`

- Schedule: `every 24 hours`
- Scrapes the current year and prior year (new filers arrive semi-annually)
- Persists a cursor in `/scrapers/lobbying`:
  - `lastFetchedAt: Timestamp`
  - `processedDiscUrls: string[]` — already-fetched disclosure URLs (skipped on
    re-runs)
- For each new disclosure URL:
  - Parse registrant + client compensation rows → upsert `lobbyingRegistrants`
    doc
  - Parse bill activity rows → batch-write `lobbyingFilings` docs
- Uses `axios` (existing dependency) with an iPad `User-Agent` header to match
  portal expectations
- Uses `jsdom` for HTML table parsing (already a dependency; used by events scraper)
- 1s delay between requests; exponential backoff on failure (matching existing
  scraper retry pattern)
- Function timeout: 540s

### Incremental Strategy

Processed disclosure URLs are stored in `/scrapers/lobbying.processedDiscUrls`.
At ~2 disclosure URLs per registrant × ~500 registrants per year, the
current+prior year window stays well within Firestore document limits.
Historical years beyond current-1 are stable (filings are frozen after year
closes) and are handled by the backfill script only.

The backfill script uses a separate Firestore document
(`/scrapers/lobbyingBackfill`) for its own cursor so it does not interfere with
the live scraper.

### Legacy Format (pre-2013)

The portal uses a different HTML layout for filings before ~2013: total salary
is not broken down by client, and all bill activity is in a single table. These
are stored with `clientName: "_total_salary_"` so callers can detect and filter
them. No bill-level compensation amount is available for these years.

---

## New Files

```
functions/src/lobbying/
  types.ts            — Runtypes definitions for LobbyingRegistrant, LobbyingFiling
  scrapeLobbying.ts   — Scheduled Cloud Function + shared parsing/normalization logic
  index.ts            — Re-exports
```

---

## Firebase Admin Script

**File:** `scripts/firebase-admin/backfillLobbying.ts`

Ingests all historical filings from 2005 to the present. This is the primary
path for all data before the current and prior year. Accepts `--year` and
`--limit` CLI args for targeted re-runs or testing. Calls the same parsing
logic exported from `functions/src/lobbying/scrapeLobbying.ts` and writes
directly to Firestore via the firebase-admin SDK.

```bash
GOOGLE_APPLICATION_CREDENTIALS=~/.config/gcloud/application_default_credentials.json \
  yarn firebase-admin run-script backfillLobbying --env dev
```

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

## Function Export

Add to `functions/src/index.ts`:

```typescript
export { scrapeLobbying } from "./lobbying"
```

---

## Implementation Status

| File                                         | Status  |
| -------------------------------------------- | ------- |
| `functions/src/lobbying/types.ts`            | ✅ Done |
| `functions/src/lobbying/normalize.ts`        | ✅ Done |
| `functions/src/lobbying/portal.ts`           | ✅ Done |
| `functions/src/lobbying/scrapeLobbying.ts`   | ✅ Done |
| `functions/src/lobbying/index.ts`            | ✅ Done |
| `scripts/firebase-admin/backfillLobbying.ts` | ✅ Done |
| `functions/src/index.ts` (export)            | ✅ Done |
| `firestore.rules`                            | ✅ Done |
| `firestore.indexes.json`                     | ✅ Done |

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

### Step 1 — Unit test: normalization

Run the normalization pipeline against known inputs and verify the outputs match
the reference implementation.

```bash
# In a Node REPL or ts-node session:
conda run -n maple-2025 ts-node -P tsconfig.script.json -e "
const { normalizeEntityName } = require('./functions/src/lobbying/normalize')
console.log(normalizeEntityName('Acme Corp., Inc. d/b/a Acme Consulting'))
// Expected: 'ACME'
console.log(normalizeEntityName('LAN-TEL COMMUNICATIONS, INC.'))
// Expected: 'LAN TEL COMMUNICATIONS'
console.log(normalizeEntityName('Law Office of Jane Smith, LLC'))
// Expected: 'JANE SMITH'
"
```

### Step 2 — Unit test: chamber normalization and billId construction

```bash
conda run -n maple-2025 ts-node -P tsconfig.script.json -e "
const { normalizeChamber, constructBillId } = require('./functions/src/lobbying/portal')
console.log(normalizeChamber('HB'))           // House Bill
console.log(normalizeChamber('SB'))           // Senate Bill
console.log(normalizeChamber('Executive'))    // Executive
console.log(normalizeChamber('FY2024'))       // Other
console.log(constructBillId('House Bill', '1234'))   // H1234
console.log(constructBillId('Senate Bill', '567'))   // S567
console.log(constructBillId('House Docket', '89'))   // HD89
console.log(constructBillId('Executive', 'EOEEA'))   // null
"
```

### Step 3 — Live portal fetch: summary links

Verify the portal is reachable and returns results for the current year. Use
`--limit 1` to minimize requests.

```bash
conda run -n maple-2025 ts-node -P tsconfig.script.json -e "
const { makePortalClient, fetchSummaryLinks } = require('./functions/src/lobbying/portal')
const client = makePortalClient()
fetchSummaryLinks(client, 2024).then(urls => {
  console.log('Summary links for 2024:', urls.length)
  console.log('First URL:', urls[0])
}).catch(console.error)
"
```

Expected: ~400–600 URLs, each containing `Summary.aspx`.

### Step 4 — Live portal fetch: summary meta + one disclosure

Pick the first summary URL from Step 3 and fetch its meta and first disclosure.

```bash
conda run -n maple-2025 ts-node -P tsconfig.script.json -e "
const { makePortalClient, fetchSummaryLinks, fetchDisclosureMeta, fetchDisclosureDetail } = require('./functions/src/lobbying/portal')
async function main() {
  const client = makePortalClient()
  const [summaryUrl] = await fetchSummaryLinks(client, 2024)
  const meta = await fetchDisclosureMeta(client, summaryUrl)
  console.log('Meta:', JSON.stringify(meta, null, 2))
  if (meta.disclosureUrls[0]) {
    const detail = await fetchDisclosureDetail(client, meta.disclosureUrls[0], 2024)
    console.log('Compensation rows:', detail.compensation.length)
    console.log('Bill rows:', detail.bills.length)
    console.log('First bill:', detail.bills[0])
  }
}
main().catch(console.error)
"
```

Verify: `meta.entityName` is non-empty, `meta.regType` is `"Lobbyist"` or
`"Employer"`, bill rows have `billId` set correctly for legislative chambers.

### Step 5 — Backfill: single year, small limit against dev Firestore

Write a small batch to the dev Firestore emulator or dev project.

```bash
# Against local emulator:
conda run -n maple-2025 yarn firebase-admin run-script backfillLobbying \
  --env local -- --year 2024 --limit 3

# Against dev project (writes real Firestore):
GOOGLE_APPLICATION_CREDENTIALS=~/.config/gcloud/application_default_credentials.json \
  conda run -n maple-2025 yarn firebase-admin run-script backfillLobbying \
  --env dev -- --year 2024 --limit 3
```

Verify in Firestore console or emulator UI:

- `lobbyingRegistrants` has 3 documents with `entityName`, `entityNameNorm`,
  `regType`, `clients`, `generalCourt`
- `lobbyingFilings` has documents with `billId` non-null for legislative rows
  and null for Executive rows
- `/scrapers/lobbyingBackfill/processedUrls` has entries with `url` and
  `processedAt` fields
- Re-running the same command skips already-processed URLs (output shows 0 new
  disclosures)

### Step 6 — Spot-check: bill join

Pick a `lobbyingFiling` document with a non-null `billId` and a `generalCourt`
≥ 192. Verify the bill exists in MAPLE:

```
/generalCourts/{filing.generalCourt}/bills/{filing.billId}
```

If the bill is found, the join key is correct. If not found, check: (a) whether
MAPLE has data for that court, (b) whether the bill number format matches
(prefix + integer, no leading zeros).

### Step 7 — Backfill: full current year

Once Step 5 passes, run without `--limit` for the current year:

```bash
GOOGLE_APPLICATION_CREDENTIALS=~/.config/gcloud/application_default_credentials.json \
  conda run -n maple-2025 yarn firebase-admin run-script backfillLobbying \
  --env dev -- --year 2024
```

Monitor progress via console output. Expected: ~500–600 registrants, ~1,000
disclosure pages, several thousand filing documents written.

### Step 8 — Backfill: full history (2005–present)

Run without `--year` to process all years. Can be interrupted and resumed:

```bash
GOOGLE_APPLICATION_CREDENTIALS=~/.config/gcloud/application_default_credentials.json \
  conda run -n maple-2025 yarn firebase-admin run-script backfillLobbying \
  --env dev
```

Expected runtime: several hours at 1s/request. The subcollection cursor at
`/scrapers/lobbyingBackfill/processedUrls` allows safe interruption and
resumption.

### Step 9 — Deploy and verify Cloud Function

Deploy the function to the dev project:

```bash
conda run -n maple-2025 firebase deploy \
  --only functions:maple:scrapeLobbying \
  --project digital-testimony-dev
```

Trigger a manual run via the Firebase console or:

```bash
conda run -n maple-2025 yarn firebase-admin run-script runScrapers \
  --env local --targets scrapeLobbying
```

Verify: Cloud Function logs show the expected number of new disclosures (should
be near zero if backfill completed, since current+prior year are already
processed).

---

## Design Decisions

| Decision                    | Choice                                                                       | Rationale                                                                                                                                                                |
| --------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Collection placement        | Top-level `/lobbyingRegistrants`, `/lobbyingFilings`                         | Lobbying data spans multiple General Courts and is not scoped to a single court like bills/members                                                                       |
| Single registrant model     | One type, `regType: "Lobbyist" \| "Employer"`                                | Individual lobbyists and firms share the same portal schema; per-bill individual attribution is not available                                                            |
| `billId` construction       | `{chamberPrefix}{billNumber}` at ingest time                                 | Raw portal data stores chamber and integer separately; the composite is what matches MAPLE's `Bill.id`                                                                   |
| `billId` null for Executive | `null` instead of agency name                                                | Prevents accidental bill lookups; makes join guard explicit at the type level                                                                                            |
| Normalized name fields      | Store both raw and `*Norm` fields                                            | Raw names preserved for provenance; normalized names used for grouping and matching                                                                                      |
| HTML parser                 | `jsdom`                                                                      | Already in `functions/package.json` (used by events scraper); no need to add cheerio                                                                                     |
| Live scraper cursor         | Array in `/scrapers/lobbying` doc                                            | ~1,000 URLs/year fits well within the 1 MB Firestore doc limit; simple and atomic with other scraper state                                                               |
| Backfill cursor             | Firestore subcollection `/scrapers/lobbyingBackfill/processedUrls/{urlHash}` | Full 2005-present history (~50,000 URLs) would exceed the 1 MB doc limit; subcollection scales without bound and is durable, inspectable, and resumable from any machine |
| Incremental strategy        | Skip already-processed disclosure URLs; write docs by logical key (upsert)   | Survives function restarts and re-runs without re-fetching already-scraped pages; natural upsert prevents duplicates without an explicit dedup pass                      |
| Legacy format (pre-2013)    | Store with `clientName: "_total_salary_"` sentinel                           | Preserves data completeness; callers can filter on this value                                                                                                            |
| Historical data             | Admin backfill script (2005 → present)                                       | Full history is ingested once; Cloud Function maintains current+prior year going forward                                                                                 |
