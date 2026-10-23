import {
  collection,
  doc,
  documentId,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  where
} from "firebase/firestore"
import { chunk, uniq } from "lodash"
import { useMemo } from "react"
import { useAsync } from "react-async-hook"
import type {
  LobbyingFiling,
  LobbyingRegistrant,
  LobbyingStats
} from "functions/src/lobbying/types"
import { firestore } from "../firebase"

// Mirror of constants in functions/src/lobbying/types.ts — kept here to avoid
// pulling firebase-admin (a Node-only package) into the browser bundle.
const FILINGS_COLLECTION = "lobbyingFilings"
const REGISTRANTS_COLLECTION = "lobbyingRegistrants"
const LOBBYING_STATS_COLLECTION = "lobbyingMeta"
const LOBBYING_STATS_DOC_ID = "stats"

// ── Internal fetchers ─────────────────────────────────────────────────────────

/** The most recent legislative session (General Court) with lobbying data. */
export async function fetchLatestLobbyingCourt(): Promise<number> {
  return latestCourt(await fetchLobbyingStats())
}

/** The session in progress: the newest with any lobbying data. */
export function latestCourt(
  stats: Pick<LobbyingStats, "courtsWithData"> | undefined
): number {
  return Math.max(...(stats?.courtsWithData ?? []))
}

/** A client's bills over the given sessions (bill numbers are per session,
 * so they add up), or null when no session has a count. */
export function sumBills(
  courts: ClientSummaryRow["courts"] | undefined
): number | null {
  const bills = Object.values(courts ?? {}).map(e => e.bills)
  return bills.some(b => b != null)
    ? bills.reduce<number>((sum, b) => sum + (b ?? 0), 0)
    : null
}

/** load(key), once per key for the life of the page; a failure is retried. */
function cachedBy<K, T>(
  cache: Map<K, Promise<T>>,
  key: K,
  load: (key: K) => Promise<T>
): Promise<T> {
  let value = cache.get(key)
  if (!value) {
    value = load(key)
    value.catch(() => cache.delete(key))
    cache.set(key, value)
  }
  return value
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to load ${url}`)
  return res.json() as Promise<T>
}

export async function fetchLobbyingStats(): Promise<LobbyingStats | undefined> {
  const snap = await getDoc(
    doc(firestore, LOBBYING_STATS_COLLECTION, LOBBYING_STATS_DOC_ID)
  )
  return snap.exists() ? (snap.data() as LobbyingStats) : undefined
}

async function fetchFilingsForBill(
  court: number,
  billId: string
): Promise<LobbyingFiling[]> {
  const snap = await getDocs(
    query(
      collection(firestore, FILINGS_COLLECTION),
      where("generalCourt", "==", court),
      where("billId", "==", billId)
    )
  )
  return snap.docs.map(d => d.data() as LobbyingFiling)
}

async function fetchRegistrants(opts: {
  regType?: "Lobbyist" | "Employer"
  year?: number
  pageSize?: number
}): Promise<LobbyingRegistrant[]> {
  const constraints = [
    opts.regType ? where("regType", "==", opts.regType) : undefined,
    opts.year ? where("year", "==", opts.year) : undefined,
    orderBy("entityNameNorm"),
    limit(opts.pageSize ?? 50)
  ].filter(Boolean) as Parameters<typeof query>[1][]

  const snap = await getDocs(
    query(collection(firestore, REGISTRANTS_COLLECTION), ...constraints)
  )
  return snap.docs.map(d => d.data() as LobbyingRegistrant)
}

async function fetchRegistrant(
  registrantId: string
): Promise<LobbyingRegistrant | undefined> {
  const snap = await getDoc(
    doc(firestore, REGISTRANTS_COLLECTION, registrantId)
  )
  return snap.exists() ? (snap.data() as LobbyingRegistrant) : undefined
}

async function fetchFilingsForRegistrant(
  registrantId: string
): Promise<LobbyingFiling[]> {
  const snap = await getDocs(
    query(
      collection(firestore, FILINGS_COLLECTION),
      where("registrantId", "==", registrantId),
      orderBy("year", "desc")
    )
  )
  return snap.docs.map(d => d.data() as LobbyingFiling)
}

async function fetchAllRegistrants(): Promise<LobbyingRegistrant[]> {
  const snap = await getDocs(
    query(
      collection(firestore, REGISTRANTS_COLLECTION),
      orderBy("entityNameNorm"),
      limit(2000)
    )
  )
  return snap.docs.map(d => d.data() as LobbyingRegistrant)
}

async function fetchRegistrantsByEntityName(
  entityNameNorm: string
): Promise<LobbyingRegistrant[]> {
  const snap = await getDocs(
    query(
      collection(firestore, REGISTRANTS_COLLECTION),
      where("entityNameNorm", "==", entityNameNorm),
      orderBy("year", "desc")
    )
  )
  return snap.docs.map(d => d.data() as LobbyingRegistrant)
}

async function fetchFilingsForEntityName(
  entityNameNorm: string
): Promise<LobbyingFiling[]> {
  const snap = await getDocs(
    query(
      collection(firestore, FILINGS_COLLECTION),
      where("entityNameNorm", "==", entityNameNorm),
      orderBy("year", "desc")
    )
  )
  return snap.docs.map(d => d.data() as LobbyingFiling)
}

async function fetchFilingsForCourt(court: number): Promise<LobbyingFiling[]> {
  const snap = await getDocs(
    query(
      collection(firestore, FILINGS_COLLECTION),
      where("generalCourt", "==", court)
    )
  )
  return snap.docs.map(d => d.data() as LobbyingFiling)
}

/** A client's filings in one session, or in every session ("all"). A big
 * client has filed thousands per session, so read only what's shown. */
async function fetchFilingsForClient(
  clientNameNorm: string,
  court: number | "all"
): Promise<LobbyingFiling[]> {
  const snap = await getDocs(
    query(
      collection(firestore, FILINGS_COLLECTION),
      where("clientNameNorm", "==", clientNameNorm),
      ...(court === "all"
        ? [orderBy("year", "desc")]
        : [where("generalCourt", "==", court)])
    )
  )
  return snap.docs.map(d => d.data() as LobbyingFiling)
}

// ── Public hooks ──────────────────────────────────────────────────────────────

export function useLobbyingFilingsForCourt(court: number) {
  return useAsync(fetchFilingsForCourt, [court])
}

export function useLobbyingAllRegistrants() {
  return useAsync(fetchAllRegistrants, [])
}

export function useLobbyingRegistrantsByEntityName(entityNameNorm: string) {
  return useAsync(fetchRegistrantsByEntityName, [entityNameNorm])
}

export function useLobbyingFilingsForEntityName(entityNameNorm: string) {
  return useAsync(fetchFilingsForEntityName, [entityNameNorm])
}

export function useLobbyingFilingsForBill(court: number, billId: string) {
  return useAsync(fetchFilingsForBill, [court, billId])
}

export function useLobbyingRegistrants(opts: {
  regType?: "Lobbyist" | "Employer"
  year?: number
  pageSize?: number
}) {
  return useAsync(fetchRegistrants, [opts])
}

export function useLobbyingRegistrant(registrantId: string) {
  return useAsync(fetchRegistrant, [registrantId])
}

export function useLobbyingFilingsForRegistrant(registrantId: string) {
  return useAsync(fetchFilingsForRegistrant, [registrantId])
}

// Firestore's limit on the values in one "in" query.
const IN_QUERY_LIMIT = 30

/** What the lobbying activity helpers need from a lobbyingRegistrants doc. */
export type RegistrantInfo = {
  periodEnd: string | null
  lobbyists: string[]
  clientLobbyists: Record<string, string[]>
}

/** The period and lobbyists of each given registrant, keyed by registrantId.
 * Ids with no doc are absent. */
export async function fetchRegistrantsByIds(
  ids: string[]
): Promise<Record<string, RegistrantInfo>> {
  const snaps = await Promise.all(
    chunk(uniq(ids), IN_QUERY_LIMIT).map(batch =>
      getDocs(
        query(
          collection(firestore, REGISTRANTS_COLLECTION),
          where(documentId(), "in", batch)
        )
      )
    )
  )
  const result: Record<string, RegistrantInfo> = {}
  for (const snap of snaps)
    for (const d of snap.docs) {
      const r = d.data() as LobbyingRegistrant
      result[d.id] = {
        periodEnd: r.periodEnd ?? null,
        lobbyists: r.lobbyists ?? [],
        clientLobbyists: r.clientLobbyists ?? {}
      }
    }
  return result
}

export function useLobbyingRegistrantsByIds(ids: string[]) {
  const idsKey = useMemo(() => uniq(ids).sort().join(","), [ids])
  return useAsync(
    (key: string) => fetchRegistrantsByIds(key ? key.split(",") : []),
    [idsKey]
  )
}

export function useLobbyingFilingsForClient(
  clientNameNorm: string,
  court: number | "all"
) {
  return useAsync(fetchFilingsForClient, [clientNameNorm, court])
}

async function fetchEntityFilingCounts(): Promise<Record<string, number>> {
  const snap = await getDoc(
    doc(firestore, LOBBYING_STATS_COLLECTION, "entityFilingCounts")
  )
  return snap.exists() ? (snap.data() as Record<string, number>) : {}
}

export type BillSummaryEntry = {
  total: number
  support: number
  oppose: number
  neutral: number
  none: number
  title?: string
  clients?: number
  lobbyists?: number
  // Distinct organizations per position; one with two positions is in both.
  // Absent on summaries computed before they existed.
  orgSupport?: number
  orgOppose?: number
  orgNeutral?: number
}

export type BillRow = {
  billId: string
  court: number
  total: number
  support: number
  oppose: number
  neutral: number
  none: number
  title: string
  clients: number
  lobbyists: number
  orgSupport: number
  orgOppose: number
  orgNeutral: number
}

async function fetchLobbyingBillSummaries(
  court: number
): Promise<Record<string, BillSummaryEntry>> {
  const snap = await getDocs(
    collection(
      firestore,
      LOBBYING_STATS_COLLECTION,
      `billSummaries_${court}`,
      "bills"
    )
  )
  const result: Record<string, BillSummaryEntry> = {}
  snap.docs.forEach(d => {
    result[d.id] = d.data() as BillSummaryEntry
  })
  return result
}

export function useLobbyingBillSummaries(court: number) {
  return useAsync(fetchLobbyingBillSummaries, [court])
}

// For one session: each client's in-house filers (entityNameNorms of its own
// staff, or the client filing for itself), keyed by clientNameNorm. Clients
// with no in-house filer are absent.
// Read once per session for the life of the page: a client page switching
// sessions comes back to the same few docs.
const inHouseFilersBySession = new Map<
  number,
  Promise<Record<string, string[]>>
>()

export function fetchInHouseFilers(
  court: number
): Promise<Record<string, string[]>> {
  return cachedBy(inHouseFilersBySession, court, async c => {
    const snap = await getDoc(
      doc(firestore, LOBBYING_STATS_COLLECTION, `inHouseFilers_${c}`)
    )
    return snap.exists() ? (snap.data() as Record<string, string[]>) : {}
  })
}

export function useLobbyingInHouseFilers(court: number) {
  return useAsync(fetchInHouseFilers, [court])
}

/** One client's in-house filers across the given sessions, merged: the
 * inHouseFilers shape, holding only that client. Reads one doc per session. */
async function fetchClientInHouseFilers(
  clientNameNorm: string,
  courts: number[]
): Promise<Record<string, string[]>> {
  const docs = await Promise.all(uniq(courts).map(fetchInHouseFilers))
  return {
    [clientNameNorm]: uniq(docs.flatMap(d => d[clientNameNorm] ?? []))
  }
}

export function useLobbyingClientInHouseFilers(
  clientNameNorm: string,
  courts: number[]
) {
  const courtsKey = uniq(courts).sort().join(",")
  return useAsync(
    (name: string, key: string) =>
      fetchClientInHouseFilers(name, key ? key.split(",").map(Number) : []),
    [clientNameNorm, courtsKey]
  )
}

// ── Client / firm summaries (precomputed server-side by compute_stats in
// lobbying-scraper/writer.py). Replaces client-side derivation over
// useLobbyingAllRegistrants(), which only fetches the first 2,000 of
// 25,000+ registrant docs and was silently showing an incomplete list. ────

export type ClientSummaryFirm = {
  entityName: string
  entityNameNorm: string
  compensation: number | null
  years: number[]
}

export type ClientSummaryRow = {
  clientName: string
  clientNameNorm: string
  totalCompensation: number | null
  registrantCount: number
  firms: ClientSummaryFirm[]
  // Per legislative session (General Court number as a string); absent on
  // summaries computed before session filters existed.
  courts?: Record<
    string,
    {
      filings: number
      lobbyistCount: number
      compensation: number | null
      // Fields below are absent on summaries computed before they existed.
      // Distinct bills in the client's filings.
      bills?: number
      // Distinct filers that are the client's own staff.
      inHouseCount?: number
      // Distinct people lobbying for the client, and the part who aren't its
      // own staff (a hired firm's agents, or a hired individual lobbyist).
      // Firms name their agents from 2014, so show these from the 189th
      // session (2015–16) on: the 188th (2013–14) has no 2013 firm agents, and
      // earlier sessions count only individual filers.
      individuals?: number
      firmAgents?: number
      // Lobbyists and entities working for the client, split into its own
      // staff and those it hired, counted from one set so they add up; a
      // hired individual counts as a one-person firm. From the 189th on,
      // pair hiredFirms with individuals/firmAgents ("k in-house · m firms
      // (n agents)"); before it, and for all sessions, the total is
      // inHouseLobbyists + hiredFirms.
      inHouseLobbyists?: number
      hiredFirms?: number
    }
  >
  // All-time counterparts of the per-session counts above (hiredFirms leaves
  // out anyone in-house in any session).
  inHouseCount?: number
  individuals?: number
  inHouseLobbyists?: number
  hiredFirms?: number
  // Earliest registration start date (ISO), the latest registration's year,
  // and its page on the SoS website.
  firstRegistered?: string | null
  lastRegisteredYear?: number | null
  registrationUrl?: string | null
}

export type FirmRegistrationParty = {
  name: string
  nameNorm: string | null
  // Whether this person or entity has a profile page of its own.
  hasProfile: boolean
}

export type FirmRegistration = {
  year: number
  // The registration page on the SoS website.
  sourceUrl: string | null
  // For an individual lobbyist: the entities they're registered under (2019+).
  employers: FirmRegistrationParty[]
  // For an entity: the lobbyists it registered.
  lobbyists: FirmRegistrationParty[]
}

export type FirmSummaryRow = {
  entityName: string
  entityNameNorm: string
  regType: string
  years: number[]
  clientCount: number
  // Fields below are absent on summaries computed before registrations were
  // stored.
  lobbyists?: string[]
  employers?: string[]
  // False for a lobbyist whose employer files all their disclosures.
  hasFilings?: boolean
  // Latest registration page on the SoS website.
  sourceUrl?: string | null
  registrations?: FirmRegistration[]
  // Per legislative session (General Court number as a string).
  courts?: Record<string, { filings: number; clientCount: number }>
}

async function fetchClientSummaries(): Promise<ClientSummaryRow[]> {
  const snap = await getDocs(
    collection(
      firestore,
      LOBBYING_STATS_COLLECTION,
      "clientSummaries",
      "clients"
    )
  )
  return snap.docs.map(d => d.data() as ClientSummaryRow)
}

export async function fetchClientSummary(
  clientNameNorm: string
): Promise<ClientSummaryRow | undefined> {
  const snap = await getDoc(
    doc(
      firestore,
      LOBBYING_STATS_COLLECTION,
      "clientSummaries",
      "clients",
      encodeURIComponent(clientNameNorm)
    )
  )
  return snap.exists() ? (snap.data() as ClientSummaryRow) : undefined
}

async function fetchFirmSummaries(): Promise<FirmSummaryRow[]> {
  const snap = await getDocs(
    collection(firestore, LOBBYING_STATS_COLLECTION, "firmSummaries", "firms")
  )
  return snap.docs.map(d => d.data() as FirmSummaryRow)
}

async function fetchFirmSummary(
  entityNameNorm: string
): Promise<FirmSummaryRow | undefined> {
  const snap = await getDoc(
    doc(
      firestore,
      LOBBYING_STATS_COLLECTION,
      "firmSummaries",
      "firms",
      encodeURIComponent(entityNameNorm)
    )
  )
  return snap.exists() ? (snap.data() as FirmSummaryRow) : undefined
}

export function useLobbyingFirmSummary(entityNameNorm: string) {
  return useAsync(fetchFirmSummary, [entityNameNorm])
}

function toBillRow(
  billId: string,
  court: number,
  e: BillSummaryEntry
): BillRow {
  return {
    billId,
    court,
    total: e.total,
    support: e.support,
    oppose: e.oppose,
    neutral: e.neutral,
    none: e.none,
    title: e.title ?? "",
    clients: e.clients ?? 0,
    lobbyists: e.lobbyists ?? 0,
    orgSupport: e.orgSupport ?? 0,
    orgOppose: e.orgOppose ?? 0,
    orgNeutral: e.orgNeutral ?? 0
  }
}

export async function fetchBillRows(court: number): Promise<BillRow[]> {
  const summaries = await fetchLobbyingBillSummaries(court)
  return Object.entries(summaries).map(([billId, e]) =>
    toBillRow(billId, court, e)
  )
}

/** A session's most-lobbied bills: the `count` with the most organizations
 * (clients). Reads only those docs. */
export async function fetchTopBillRows(
  court: number,
  count: number
): Promise<BillRow[]> {
  const snap = await getDocs(
    query(
      collection(
        firestore,
        LOBBYING_STATS_COLLECTION,
        `billSummaries_${court}`,
        "bills"
      ),
      orderBy("clients", "desc"),
      limit(count)
    )
  )
  return snap.docs.map(d =>
    toBillRow(d.id, court, d.data() as BillSummaryEntry)
  )
}

// Reads through the CDN-cached API route rather than Firestore directly, and
// keeps each session's rows for the life of the page so changing the selected
// sessions doesn't refetch them.
const billRowsBySession = new Map<number, Promise<BillRow[]>>()

function fetchCachedBillRows(court: number): Promise<BillRow[]> {
  return cachedBy(billRowsBySession, court, c =>
    fetchJson<BillRow[]>(`/api/lobbying/bills/${c}`)
  )
}

export function useLobbyingBillRows(courts: number[]) {
  const courtsKey = courts.join(",")
  return useAsync(
    async (key: string) => {
      if (!key) return [] as BillRow[]
      const rows = await Promise.all(
        key.split(",").map(Number).map(fetchCachedBillRows)
      )
      return rows.flat()
    },
    [courtsKey]
  )
}

// ── Rows for the prerendered Lobbyists and Clients lists. Fetched in
// getStaticProps (at build and on daily revalidation), so they must be
// JSON-serializable (null, never undefined) and hold only what the lists
// show, since they're embedded in the page. ─────────────────────────────────

export type FirmListRow = {
  entityName: string
  entityNameNorm: string
  regType: string
  years: number[]
  clientCount: number
  totalFilings: number | null
  lobbyists: string[]
  employers: string[]
  hasFilings: boolean
  courts: Record<string, { filings: number; clientCount: number }>
}

export async function fetchFirmListRows(): Promise<FirmListRow[]> {
  const [summaries, filingCounts] = await Promise.all([
    fetchFirmSummaries(),
    fetchEntityFilingCounts()
  ])
  return summaries.map(f => ({
    entityName: f.entityName,
    entityNameNorm: f.entityNameNorm,
    regType: f.regType,
    years: f.years,
    clientCount: f.clientCount,
    totalFilings: filingCounts[f.entityNameNorm] ?? null,
    lobbyists: f.lobbyists ?? [],
    employers: f.employers ?? [],
    hasFilings: f.hasFilings ?? true,
    courts: f.courts ?? {}
  }))
}

/** A Clients list row for one session, or for all of them: only what the
 * list shows. People counts (individuals, firmAgents) are per session, so
 * null for all sessions. */
export type ClientListRow = {
  clientName: string
  clientNameNorm: string
  bills: number | null
  compensation: number | null
  individuals: number | null
  firmAgents: number | null
  inHouseLobbyists: number | null
  hiredFirms: number | null
}

/** The Clients list for one session (its active clients) or for all
 * sessions, and every session any client was active in. Reads every client
 * summary, so it runs server-side: at build/revalidation, or in the cached
 * /api/lobbying/clients/[session] route. */
export async function fetchClientList(
  session: number | "all"
): Promise<{ sessions: number[]; rows: ClientListRow[] }> {
  const summaries = await fetchClientSummaries()
  const sessions = [
    ...new Set(summaries.flatMap(c => Object.keys(c.courts ?? {})))
  ]
    .map(Number)
    .sort((a, b) => b - a)
  const rows = summaries.flatMap((c): ClientListRow[] => {
    const name = { clientName: c.clientName, clientNameNorm: c.clientNameNorm }
    if (session === "all") {
      return [
        {
          ...name,
          bills: sumBills(c.courts),
          compensation: c.totalCompensation ?? null,
          individuals: null,
          firmAgents: null,
          inHouseLobbyists: c.inHouseLobbyists ?? null,
          hiredFirms: c.hiredFirms ?? null
        }
      ]
    }
    const e = c.courts?.[String(session)]
    if (!e) return []
    return [
      {
        ...name,
        bills: e.bills ?? null,
        compensation: e.compensation ?? null,
        individuals: e.individuals ?? null,
        firmAgents: e.firmAgents ?? null,
        inHouseLobbyists: e.inHouseLobbyists ?? null,
        hiredFirms: e.hiredFirms ?? null
      }
    ]
  })
  return { sessions, rows }
}

// Other sessions' rows load through the CDN-cached API route, once each for
// the life of the page, as the Bills list's do.
const clientRowsBySession = new Map<number | "all", Promise<ClientListRow[]>>()

function fetchCachedClientRows(
  session: number | "all"
): Promise<ClientListRow[]> {
  return cachedBy(clientRowsBySession, session, s =>
    fetchJson<ClientListRow[]>(`/api/lobbying/clients/${s}`)
  )
}

/** One session's Clients list rows, or undefined for none (e.g. the
 * prerendered session). */
export function useLobbyingClientRows(session: number | "all" | undefined) {
  return useAsync(
    async (s: number | "all" | undefined) =>
      s === undefined ? undefined : fetchCachedClientRows(s),
    [session]
  )
}
