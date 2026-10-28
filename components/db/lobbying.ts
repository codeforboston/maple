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

/**
 * useAsync, but `result` always belongs to the current arguments. Right after
 * they change, react-async-hook still reports the previous result (and
 * "success") for a render, which would show one session's rows under
 * another's label; until the new result arrives this reports "loading".
 */
function useCurrentAsync<R, A extends unknown[]>(
  fn: (...args: A) => Promise<R>,
  args: A
) {
  const key = JSON.stringify(args)
  const state = useAsync(
    async (...a: A) => ({ key: JSON.stringify(a), value: await fn(...a) }),
    args
  )
  const current = state.result?.key === key
  return {
    ...state,
    result: current ? state.result?.value : undefined,
    status: state.status === "success" && !current ? "loading" : state.status,
    loading: state.loading || (state.status === "success" && !current)
  }
}

// ── Internal fetchers ─────────────────────────────────────────────────────────

/** The most recent legislative session (General Court) with lobbying data. */
export async function fetchLatestLobbyingCourt(): Promise<number> {
  return latestCourt(await fetchLobbyingStats())
}

/** The session in progress: the newest with any lobbying data. */
/** Every session with lobbying data, newest first. */
export function sessionsNewestFirst(
  stats: Pick<LobbyingStats, "courtsWithData"> | undefined
): number[] {
  return [...(stats?.courtsWithData ?? [])].sort((a, b) => b - a)
}

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
  return useCurrentAsync(fetchFilingsForCourt, [court])
}

export function useLobbyingAllRegistrants() {
  return useCurrentAsync(fetchAllRegistrants, [])
}

export function useLobbyingRegistrantsByEntityName(entityNameNorm: string) {
  return useCurrentAsync(fetchRegistrantsByEntityName, [entityNameNorm])
}

export function useLobbyingFilingsForEntityName(entityNameNorm: string) {
  return useCurrentAsync(fetchFilingsForEntityName, [entityNameNorm])
}

export function useLobbyingFilingsForBill(court: number, billId: string) {
  return useCurrentAsync(fetchFilingsForBill, [court, billId])
}

export function useLobbyingRegistrants(opts: {
  regType?: "Lobbyist" | "Employer"
  year?: number
  pageSize?: number
}) {
  return useCurrentAsync(fetchRegistrants, [opts])
}

export function useLobbyingRegistrant(registrantId: string) {
  return useCurrentAsync(fetchRegistrant, [registrantId])
}

export function useLobbyingFilingsForRegistrant(registrantId: string) {
  return useCurrentAsync(fetchFilingsForRegistrant, [registrantId])
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
  return useCurrentAsync(
    (key: string) => fetchRegistrantsByIds(key ? key.split(",") : []),
    [idsKey]
  )
}

export function useLobbyingFilingsForClient(
  clientNameNorm: string,
  court: number | "all"
) {
  return useCurrentAsync(fetchFilingsForClient, [clientNameNorm, court])
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
  // Each organization once, by the positions it reported in its latest
  // half-year, as on the Bill page: more than one is "multiple". They add up
  // to the organizations with a position.
  orgLatestSupport?: number
  orgLatestOppose?: number
  orgLatestNeutral?: number
  orgLatestMultiple?: number
}

/** A Bills list row: only what the lists show (it's embedded in the page
 * and served by the bills API route). */
export type BillRow = {
  billId: string
  court: number
  // Filings.
  total: number
  title: string
  // Organizations.
  clients: number
  orgLatestSupport: number
  orgLatestOppose: number
  orgLatestNeutral: number
  orgLatestMultiple: number
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
  return useCurrentAsync(fetchLobbyingBillSummaries, [court])
}

// For one session: each client's in-house filers (entityNameNorms of its own
// staff, or the client filing for itself), keyed by clientNameNorm. Clients
// with no in-house filer are absent.
async function fetchInHouseFilers(
  court: number
): Promise<Record<string, string[]>> {
  const snap = await getDoc(
    doc(firestore, LOBBYING_STATS_COLLECTION, `inHouseFilers_${court}`)
  )
  return snap.exists() ? (snap.data() as Record<string, string[]>) : {}
}

export function useLobbyingInHouseFilers(court: number) {
  return useCurrentAsync(fetchInHouseFilers, [court])
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
      // Hired firms that named no agents for the client: with individuals,
      // the exact people total from the 189th session on.
      firmsWithoutAgents?: number
      // The client's in-house filers that session (entityNameNorms), as in
      // inHouseFilers_{gc}.
      inHouseFilers?: string[]
    }
  >
  // All-time counterparts of the per-session counts above (hiredFirms leaves
  // out anyone in-house in any session).
  inHouseCount?: number
  individuals?: number
  inHouseLobbyists?: number
  hiredFirms?: number
  // Earliest registration start date (ISO), the latest registration's year,
  // and the client's own page on the SoS website (else the latest
  // registration listing it).
  firstRegistered?: string | null
  lastRegisteredYear?: number | null
  registrationUrl?: string | null
  // The portal's "No client": listed, but not an organization, so not counted
  // as a client. Absent on every other client.
  placeholder?: true
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
  return useCurrentAsync(fetchFirmSummary, [entityNameNorm])
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
    title: e.title ?? "",
    clients: e.clients ?? 0,
    orgLatestSupport: e.orgLatestSupport ?? 0,
    orgLatestOppose: e.orgLatestOppose ?? 0,
    orgLatestNeutral: e.orgLatestNeutral ?? 0,
    orgLatestMultiple: e.orgLatestMultiple ?? 0
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
  return useCurrentAsync(
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

/** A Lobbyists list row for one session (its lobbyists and entities, with
 * that session's clients and filings) or for all sessions. */
export type FirmSessionRow = {
  entityName: string
  entityNameNorm: string
  regType: string
  years: number[]
  clientCount: number
  // Null when there are none to show.
  filings: number | null
  lobbyists: string[]
  employers: string[]
  // False for one with no filings of its own (that session, or ever).
  hasFilings: boolean
}

/** The Lobbyists list for one session, from its precomputed firmList doc
 * (one read), or for all sessions from every firm summary (there's no
 * all-sessions doc: it would pass Firestore's 1 MiB limit). Runs
 * server-side: at build/revalidation, or in the cached
 * /api/lobbying/firms/[session] route. */
export async function fetchFirmList(
  session: number | "all"
): Promise<FirmSessionRow[]> {
  if (session === "all") {
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
      filings: filingCounts[f.entityNameNorm] ?? null,
      lobbyists: f.lobbyists ?? [],
      employers: f.employers ?? [],
      hasFilings: f.hasFilings ?? true
    }))
  }
  const snap = await getDoc(
    doc(firestore, LOBBYING_STATS_COLLECTION, `firmList_${session}`)
  )
  const entries = (snap.data() ?? {}) as Record<string, FirmListEntry>
  return Object.entries(entries).map(([entityNameNorm, e]) => {
    // Active that session: filings, or clients it reported. Registered with
    // neither, its counts show as "—".
    const active = e.filings > 0 || e.clientCount > 0
    return {
      entityName: e.name,
      entityNameNorm,
      regType: e.regType,
      years: e.years,
      clientCount: e.clientCount,
      filings: active ? e.filings : null,
      lobbyists: e.lobbyists ?? [],
      employers: e.employers ?? [],
      hasFilings: active
    }
  })
}

// Precomputed list docs written by compute_stats, so the list pages' API
// routes read one document instead of every summary: lobbyingMeta/
// clientList_{court} and clientList_all, and firmList_{court} (no
// all-sessions lobbyist doc: it would pass Firestore's 1 MiB limit). Each
// holds its rows under `rows`, a map keyed by the normalized name.
export type ClientListEntry = {
  name: string
  bills: number
  compensation: number | null
  // Per session only (absent in clientList_all).
  individuals?: number
  firmAgents?: number
  firmsWithoutAgents?: number
  inHouseLobbyists: number
  hiredFirms: number
  // "No client" (see ClientSummaryRow.placeholder).
  placeholder?: true
}

export type FirmListEntry = {
  name: string
  regType: string
  years: number[]
  // For the doc's session.
  clientCount: number
  filings: number
  lobbyists?: string[]
  employers?: string[]
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
  firmsWithoutAgents: number | null
  inHouseLobbyists: number | null
  hiredFirms: number | null
  // "No client": listed, but not an organization. Set only when true, so
  // the other rows' payload doesn't grow.
  placeholder?: true
}

/** The Clients list for one session (its active clients) or for all
 * sessions, from its precomputed list doc (one read). Runs server-side: at
 * build/revalidation, or in the cached /api/lobbying/clients/[session]
 * route. */
export async function fetchClientList(
  session: number | "all"
): Promise<ClientListRow[]> {
  const snap = await getDoc(
    doc(firestore, LOBBYING_STATS_COLLECTION, `clientList_${session}`)
  )
  const entries = (snap.data() ?? {}) as Record<string, ClientListEntry>
  return Object.entries(entries).map(([clientNameNorm, e]) => ({
    clientName: e.name,
    clientNameNorm,
    bills: e.bills ?? null,
    compensation: e.compensation ?? null,
    individuals: e.individuals ?? null,
    firmAgents: e.firmAgents ?? null,
    firmsWithoutAgents: e.firmsWithoutAgents ?? null,
    inHouseLobbyists: e.inHouseLobbyists ?? null,
    hiredFirms: e.hiredFirms ?? null,
    ...(e.placeholder ? { placeholder: true as const } : {})
  }))
}

/** A hook for a list's rows of one session (or all), loaded through its
 * CDN-cached API route (`/api/lobbying/<list>/<session>`), each once for the
 * life of the page. Undefined loads nothing (e.g. the prerendered session). */
function sessionRowsHook<R>(list: string) {
  const bySession = new Map<number | "all", Promise<R[]>>()
  const load = (session: number | "all" | undefined) =>
    session === undefined
      ? Promise.resolve(undefined)
      : cachedBy(bySession, session, s =>
          fetchJson<R[]>(`/api/lobbying/${list}/${s}`)
        )
  return function useSessionRows(session: number | "all" | undefined) {
    return useCurrentAsync(load, [session])
  }
}

export const useLobbyingClientRows = sessionRowsHook<ClientListRow>("clients")
export const useLobbyingFirmRows = sessionRowsHook<FirmSessionRow>("firms")
