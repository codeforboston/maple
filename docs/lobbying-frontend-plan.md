# Lobbying Explorer — Frontend Plan

_Living document. Update as implementation progresses._

---

## Overview

A dedicated **Lobbying Explorer** section of MAPLE, surfacing OCPF lobbying disclosure
data as a first-class feature alongside bills and testimony. The explorer is a new
top-level nav item that provides four browsable entity views (overview, bills, clients,
firms) and integrates lightly into existing bill detail pages. Full visual design is
deferred to the design team; this phase establishes the data layer, routing skeleton,
i18n scaffolding, and placeholder UI.

---

## Routes

```
/lobbying                         — overview: stats, search, entry cards
/lobbying/bills                   — browse all lobbied bills
/lobbying/clients                 — browse clients / sponsors
/lobbying/clients/[clientSlug]    — client detail
/lobbying/firms                   — browse lobbying firms (registrants)
/lobbying/firms/[registrantId]    — firm detail
```

Existing bill detail pages get one lightweight sidebar card (filing count + link to
`/lobbying/bills?bill=H1234&gc=193`). No other pages are touched.

---

## Navigation

Add **Lobbying** as a new top-level item in the primary navbar, between Bills and Learn.

```tsx
// components/NavbarComponents.tsx — new export
export const NavbarLinkLobbying: React.FC<...> = ({ handleClick }) => {
  const { t } = useTranslation("common")
  return (
    <NavbarDropdownLink href="/lobbying" handleClick={handleClick}>
      {t("navigation.lobbying")}
    </NavbarDropdownLink>
  )
}
```

Add `"navigation.lobbying": "Lobbying"` to `public/locales/en/common.json`.

---

## Data Model

### Firestore schema (current — from `lobbying-data-pipeline`)

| Collection            | Doc ID           | Key fields                                                                                                      |
| --------------------- | ---------------- | --------------------------------------------------------------------------------------------------------------- |
| `lobbyingRegistrants` | `{registrantId}` | `entityName`, `regType`, `year`, `generalCourt`, `clients[]`, `disclosureUrls[]`                                |
| `lobbyingFilings`     | `{filingId}`     | `billId`, `generalCourt`, `entityName`, `clientName`, `clientNameNorm`, `position`, `amount`, `year`, `chamber` |

### Required additions

**1. Add `registrantId` to `LobbyingFiling`**

`lobbyingFilings` currently stores `entityName` (string) but not the registrant document
ID. Without this, querying all filings for a firm requires a `where("entityName", "==", x)`
string match instead of an indexed ID lookup. Add `registrantId: string` to
`LobbyingFiling` type and populate it in the scraper.

**2. Add `lobbyingStats` singleton document**

Pre-computed by the ingest pipeline. Avoids expensive client-side aggregations on the
overview page.

```ts
// functions/src/lobbying/types.ts
export const LobbyingStats = Record({
  totalFilings: Number,
  totalRegistrants: Number,
  totalClients: Number, // distinct clientNameNorm
  totalBillsWithFilings: Number, // distinct (billId, generalCourt) pairs
  courtsWithData: Array(Number), // sorted list of general court numbers
  spendByYear: Record(String, Number), // { "2023": 88775472, ... }
  filingsByYear: Record(String, Number) // { "2023": 42000, ... }
})
export type LobbyingStats = Static<typeof LobbyingStats>
export const LOBBYING_STATS_DOC = "lobbyingStats" // top-level doc
```

**3. Add `lobbyingClients` collection**

Clients are currently embedded in `registrants.clients[]`. A flat collection enables
efficient browse, search, and pagination.

```ts
export const LobbyingClientSummary = Record({
  clientSlug: String, // URL-safe slug for routing
  clientName: String,
  clientNameNorm: String,
  totalFilings: Number,
  totalAmount: Null.Or(Number),
  years: Array(Number),
  generalCourts: Array(Number),
  positionCounts: Record({
    // { support: N, oppose: N, neutral: N, none: N }
    support: Number,
    oppose: Number,
    neutral: Number,
    none: Number
  }),
  registrantIds: Array(String) // firms they have worked with
})
export const CLIENTS_COLLECTION = "lobbyingClients"
```

**4. Required Firestore indexes**

Add to `firestore.indexes.json`:

```json
{ "collectionGroup": "lobbyingFilings",
  "fields": [{"fieldPath": "billId"}, {"fieldPath": "generalCourt"}] },
{ "collectionGroup": "lobbyingFilings",
  "fields": [{"fieldPath": "registrantId"}, {"fieldPath": "year", "order": "DESCENDING"}] },
{ "collectionGroup": "lobbyingFilings",
  "fields": [{"fieldPath": "clientNameNorm"}, {"fieldPath": "year", "order": "DESCENDING"}] },
{ "collectionGroup": "lobbyingFilings",
  "fields": [{"fieldPath": "generalCourt"}, {"fieldPath": "year", "order": "DESCENDING"}] }
```

---

## Data hooks (`components/db/lobbying.ts`, new file)

All hooks use `useAsync` pattern with loading/error states, following existing
conventions in `components/db/`.

```ts
// Overview stats (reads lobbyingStats singleton)
useLobbyingStats(): AsyncResult<LobbyingStats>

// Filings for a specific bill — used in bill sidebar and lobbying/bills?bill=
useLobbyingFilingsForBill(court: number, billId: string): AsyncResult<LobbyingFiling[]>

// Paginated registrant browse
useLobbyingRegistrants(opts: {
  regType?: "Lobbyist" | "Employer"
  year?: number
  pageSize?: number
}): AsyncResult<LobbyingRegistrant[]>

// Single registrant + their filings
useLobbyingRegistrant(registrantId: string): AsyncResult<LobbyingRegistrant>
useLobbyingFilingsForRegistrant(registrantId: string): AsyncResult<LobbyingFiling[]>

// Client browse and detail
useLobbyingClients(opts?: { year?: number }): AsyncResult<LobbyingClientSummary[]>
useLobbyingClient(clientSlug: string): AsyncResult<LobbyingClientSummary>
useLobbyingFilingsForClient(clientNameNorm: string): AsyncResult<LobbyingFiling[]>
```

---

## i18n

New namespace `lobbying` in `public/locales/en/lobbying.json`. All standalone lobbying
pages use `createGetStaticTranslationProps(["auth", "common", "footer", "lobbying"])`.

The bill sidebar card reuses existing `common` namespace keys (`bill.lobbying_parties`,
`bill.client_name`, `bill.position`, `bill.disclosure_date`, `bill.pro`, `bill.neutral`).

```json
{
  "title": "Lobbying Explorer",
  "subtitle": "Browse Massachusetts lobbying disclosures filed with the Secretary of State.",
  "stats": {
    "totalBills": "Lobbied bills",
    "totalClients": "Clients",
    "sessionsCovered": "Sessions covered",
    "totalSpend": "Total compensation reported"
  },
  "sections": {
    "bills": "Bills",
    "clients": "Clients",
    "firms": "Lobbying Firms"
  },
  "filters": {
    "session": "Session",
    "year": "Year",
    "position": "Position",
    "allSessions": "All sessions",
    "allPositions": "All positions",
    "search": "Search…"
  },
  "position": {
    "support": "Support",
    "oppose": "Oppose",
    "neutral": "Neutral",
    "none": "No position"
  },
  "fields": {
    "clientName": "Client",
    "firmName": "Lobbying Firm",
    "amount": "Compensation",
    "year": "Year",
    "filings": "Filings",
    "bills": "Bills lobbied",
    "clients": "Clients represented"
  },
  "attribution": "Data from the <0>MA Secretary of State Lobbyist Public Search</0>.",
  "noData": "No lobbying filings found.",
  "loading": "Loading lobbying data…",
  "titles": {
    "overview": "Lobbying Explorer",
    "bills": "Lobbied Bills",
    "clients": "Clients & Sponsors",
    "firms": "Lobbying Firms",
    "client": "Client Profile",
    "firm": "Firm Profile"
  },
  "billCard": {
    "filingCount_one": "{{count}} lobbying filing",
    "filingCount_other": "{{count}} lobbying filings",
    "viewAll": "View all lobbying activity →"
  }
}
```

---

## Components

All in a new `components/lobbying/` directory. These are functional placeholders
designed to be restyled by the design team without changing props or data dependencies.

### `LobbyingStatsBar`

Overview stats (total bills, clients, sessions, spend) displayed as `TitledSectionCard`
stat boxes. Reads from `useLobbyingStats()`.

### `LobbyingPositionChip`

Inline pill showing position: Support (green) / Oppose (red) / Neutral (grey) / None.
Used throughout tables and detail pages.

```tsx
<LobbyingPositionChip position="support" /> // → "Support" pill
```

### `LobbyingFilingsTable`

Shared table component used across bill sidebar, client detail, and firm detail.
Columns configurable via props — different views show different subsets.

```tsx
interface LobbyingFilingsTableProps {
  filings: LobbyingFiling[]
  showBill?: boolean // show Bill ID + title column (off for bill-scoped view)
  showClient?: boolean // show Client column
  showFirm?: boolean // show Firm column
  showAmount?: boolean
  maxRows?: number // truncate with "View all" link
}
```

### `LobbyingBillCard`

Lightweight sidebar card for bill detail pages. Shows filing count, stacked
support/oppose/neutral bar, and a "View all lobbying activity →" link.

```tsx
interface LobbyingBillCardProps {
  court: number
  billId: string
  className?: string
}
```

Replaces the dummy `LobbyingTable` component. Enabled by updating the
`lobbyingTable` feature flag to `true` in dev.

### `LobbyingEntityCard`

Summary card for browse lists (one card per client or firm). Shows name, filing count,
year range, and a position summary bar. Reused in both `/lobbying/clients` and
`/lobbying/firms` list views.

---

## Visualizations

These are proposed charts for detail and overview pages. Implementation uses
**Recharts** (to be added as a dependency) — lightweight, React-native, composable.

| Chart                              | Location                              | Type                   | Data                                                |
| ---------------------------------- | ------------------------------------- | ---------------------- | --------------------------------------------------- |
| Support/oppose/neutral stacked bar | Bill sidebar card, lobbied-bills list | Horizontal stacked bar | `n_supporters`, `n_opposers`, `n_neutrals` per bill |
| Position donut                     | Client detail, Firm detail            | Doughnut               | Filing position breakdown                           |
| Spend by year                      | Client detail, Firm detail            | Bar                    | `spendByYear` from filings                          |
| Total spend + filings over time    | Overview page                         | Dual-axis line         | `LobbyingStats.spendByYear` + `filingsByYear`       |
| Top tags horizontal bar            | Client detail                         | Horizontal bar         | MAPLE bill tags from filings for that client        |
| Position heatmap by session        | Client detail (optional)              | Grid heatmap           | Position per general court                          |

All charts are conditionally rendered only when data is loaded and non-empty. The
position stacked bar on the bill sidebar is the highest-value chart — it answers
"who is on which side" at a glance and should be treated as the MVP chart.

---

## Pages

Every page follows the redesign canvas's layout, labels and interactions, in
MAPLE's colors and type: white `LobbyingPanel` cards with uppercase titles, a
boxed filter bar whose session select (`SessionSelect`) marks the session in
progress, and the attribution line. Missing figures render as "—".

### `/lobbying` — Overview (`pages/lobbying/index.tsx`)

- Prerendered (ISR, daily) with `lobbyingMeta/stats` and each session's five
  most-lobbied bills (a `clients`-ordered query of 5 docs per session); the
  browser reads nothing.
- Session: the select, or a click on a bar of the payments chart; defaults to
  the latest session. "All sessions" shows the all-time figures.
- Key figures for the session from `stats.courts[court]` (all-time totals for
  "All sessions"): bills, clients, lobbyists (plus firms and entities) and
  reported paid, each with an "i" toggle for its definition.
- Payments chart: one bar per session (`spendByYear` summed over its two
  years), the selected one highlighted and the session in progress striped.
- Most-lobbied bills: the top 5 by organizations, with a `PositionBar` of
  organizations per position, linking to `/lobbying/bills?session=<court>`.
  "All sessions" shows the top 5 of all sessions, taken from the sessions' own
  top 5s.

### `/lobbying/bills` — Lobbied bills (`pages/lobbying/bills/index.tsx`)

- Prerendered with the latest session's rows (ISR, daily); other sessions load
  through the cached `/api/lobbying/bills/[court]` route. Reads `?session=`.
- Filters: session (one, or all) and bill number or title.
- Columns: Bill, Title, Organizations (sortable; filings beneath), and a
  `PositionBar` of `orgLatestSupport/Oppose/Neutral/Multiple` with hover
  counts: each organization once, by its latest half-year's positions, as on
  the Bill page (the Overview's most-lobbied bills use the same counts).

### `/lobbying/bills/[court]/[billId]` — Bill detail

- Reads the bill's filings, their registrants (`useLobbyingRegistrantsByIds`)
  and the session's `inHouseFilers_{court}` doc.
- Header: bill number and session, the title, links to the MAPLE bill page
  (192nd session on) and the SoS search page (it can't link to one bill).
- Summary: organizations, filings and filers; `PositionBar` of organizations
  by their most recent positions (`orgPositionBreakdown`), with "multiple".
  "No client" (lobbyists who reported no client) is a table row tagged "Not
  an organization", but isn't counted as one, as in the stored counts
  (`organizationRows`); its filings and filers count. The legacy total row
  isn't listed at all. `isLegacyTotalClient` and `isNoClient` in
  `activity.ts` mirror the scraper.
- `ActivityTable` with a row per organization, filtered by position and name;
  a row expands to each filer's position in every report period of the
  session so far, and SoS filing links.

### `/lobbying/clients` — Clients (`pages/lobbying/clients/index.tsx`)

- Prerendered with the latest session's rows (ISR, daily); other sessions
  and "All sessions" load through the cached `/api/lobbying/clients/[session]`
  route. Each reads one precomputed doc, `clientList_{court}` or
  `clientList_all`, written by `compute_stats`.
- Columns: Client, Bills, Lobbyists ("k in-house · m firms (n agents)", see
  `lobbyistMix` in `components/lobbying/clientCounts.ts`) and Reported paid;
  Client, Lobbyists and Reported paid sort both ways.
- From the 189th session the lobbyist counts are people: `individuals` plus
  `firmsWithoutAgents` (hired firms that named no agents), with `firmAgents`
  as the agents; before it, and for all sessions, `inHouseLobbyists` and
  `hiredFirms`.
- "No client" (`placeholder: true`) sorts in with the rest, tagged "Not an
  organization", with only its people count under Lobbyists, and is left out
  of the "N clients" count.

### `/lobbying/clients/[clientSlug]` — Client detail

- Prerendered on first visit (ISR, daily) with the client's summary (less its
  `firms`) and the current session. The browser reads the selected session's
  filings and their registrants; the in-house filers come from the summary
  (`courts[gc].inHouseFilers`).
- Header: name, registration years and the SoS registration link.
- Session (default: the client's latest) drives the summary (bills,
  lobbyists, reported paid) and the `ActivityTable` with a row per bill,
  filtered by position and bill number or title.
- "No client"'s page says it isn't an organization instead of the
  registration line, has no in-house clause, and its filers show no
  in-house/firm kind (`filerKinds={false}`).

### `/lobbying/firms` — Lobbyists (`pages/lobbying/firms/index.tsx`)

- Prerendered with the current session's rows (ISR, daily), from the
  precomputed `firmList_{court}` doc; other sessions load through the cached
  `/api/lobbying/firms/[session]` route, and "All sessions" from every firm
  summary (no all-sessions doc: it would pass Firestore's 1 MiB limit).
- Filters by session (opening on the current one), `regType` (Lobbyist /
  Employer / all) and name; the type shows as a pill.

### `/lobbying/firms/[registrantId]` — Lobbyist detail (`pages/lobbying/firms/[registrantId].tsx`)

- Unchanged by the redesign, except that "No client" in its client list is
  tagged "Not an organization".

---

## Bill Page Integration

In `components/bill/BillDetails.tsx`, replace the existing dummy `LobbyingTable` with
`LobbyingBillCard`. The feature flag `lobbyingTable` stays as the gate.

```tsx
{
  flags.lobbyingTable && (
    <LobbyingBillCard
      court={bill.court}
      billId={bill.id}
      className="mt-4 pb-1"
    />
  )
}
```

The card is intentionally lightweight: one line of filing count, one stacked bar, one
link. The bill page is not the primary place for lobbying exploration.

---

## Implementation Phases

### Phase 1 — Foundation (current)

- [ ] Add Firestore schema additions (`registrantId` on filings, `lobbyingStats`, `lobbyingClients`)
- [ ] Add Firestore indexes to `firestore.indexes.json`
- [ ] Add data hooks (`components/db/lobbying.ts`)
- [ ] Add `lobbying.json` locale file
- [ ] Add `NavbarLinkLobbying` to navbar
- [ ] Build `LobbyingBillCard` (replaces dummy `LobbyingTable` in bill detail)
- [ ] Enable `lobbyingTable` feature flag in dev
- [ ] Build `LobbyingPositionChip` and `LobbyingFilingsTable` shared components

### Phase 2 — Browse pages (after design)

- [ ] Install Recharts
- [ ] Overview page with stats and search
- [ ] Bills browse page
- [ ] Clients browse + detail pages
- [ ] Firms browse + detail pages
- [ ] Add position stacked bar chart to bill card

### Phase 3 — Polish

- [ ] Mobile responsive layouts
- [ ] Pagination and loading states
- [ ] Attribution links to SoS on every lobbying page
- [ ] Empty states and error states
- [ ] Run `firestore.indexes.json` deploy

---

## Open Questions

1. **Navbar label**: "Lobbying" or "Lobbying Explorer"? Keep short for nav.
2. **Bill page flag**: Enable `lobbyingTable` in prod when Phase 1 is ready, or wait for design sign-off?
3. **Client slug generation**: Use `clientNameNorm` directly (already normalized in pipeline) or generate a separate URL slug? Recommend reusing `clientNameNorm` with any remaining non-URL chars stripped.
4. **Recharts vs react-chartjs-2**: Recharts is recommended (pure React, no canvas imperative API). Confirm with team before adding dependency.
5. **SoS attribution link format**: The `LobbyingRegistrant` stores `disclosureUrls[]` which are direct SoS filing URLs. Use these for deep-linking from firm detail pages.
