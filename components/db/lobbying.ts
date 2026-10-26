import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  where
} from "firebase/firestore"
import { useAsync } from "react-async-hook"
import type {
  LobbyingClientSummary,
  LobbyingFiling,
  LobbyingRegistrant,
  LobbyingStats
} from "functions/src/lobbying/types"
import { firestore } from "../firebase"

// Mirror of constants in functions/src/lobbying/types.ts — kept here to avoid
// pulling firebase-admin (a Node-only package) into the browser bundle.
const FILINGS_COLLECTION = "lobbyingFilings"
const REGISTRANTS_COLLECTION = "lobbyingRegistrants"
const CLIENTS_COLLECTION = "lobbyingClients"
const LOBBYING_STATS_COLLECTION = "lobbyingMeta"
const LOBBYING_STATS_DOC_ID = "stats"

// ── Internal fetchers ─────────────────────────────────────────────────────────

/** The most recent legislative session (General Court) with lobbying data. */
export async function fetchLatestLobbyingCourt(): Promise<number> {
  const stats = await fetchLobbyingStats()
  return Math.max(...(stats?.courtsWithData ?? []))
}

async function fetchLobbyingStats(): Promise<LobbyingStats | undefined> {
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

async function fetchClients(opts: {
  year?: number
  pageSize?: number
}): Promise<LobbyingClientSummary[]> {
  const constraints = [
    opts.year ? where("years", "array-contains", opts.year) : undefined,
    orderBy("clientNameNorm"),
    limit(opts.pageSize ?? 50)
  ].filter(Boolean) as Parameters<typeof query>[1][]

  const snap = await getDocs(
    query(collection(firestore, CLIENTS_COLLECTION), ...constraints)
  )
  return snap.docs.map(d => d.data() as LobbyingClientSummary)
}

async function fetchClient(
  clientSlug: string
): Promise<LobbyingClientSummary | undefined> {
  const snap = await getDoc(doc(firestore, CLIENTS_COLLECTION, clientSlug))
  return snap.exists() ? (snap.data() as LobbyingClientSummary) : undefined
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

async function fetchFilingsForClient(
  clientNameNorm: string
): Promise<LobbyingFiling[]> {
  const snap = await getDocs(
    query(
      collection(firestore, FILINGS_COLLECTION),
      where("clientNameNorm", "==", clientNameNorm),
      orderBy("year", "desc")
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

export function useLobbyingStats() {
  return useAsync(fetchLobbyingStats, [])
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

export function useLobbyingClients(
  opts: { year?: number; pageSize?: number } = {}
) {
  return useAsync(fetchClients, [opts])
}

export function useLobbyingClient(clientSlug: string) {
  return useAsync(fetchClient, [clientSlug])
}

export function useLobbyingFilingsForClient(clientNameNorm: string) {
  return useAsync(fetchFilingsForClient, [clientNameNorm])
}

async function fetchEntityFilingCounts(): Promise<Record<string, number>> {
  const snap = await getDoc(
    doc(firestore, LOBBYING_STATS_COLLECTION, "entityFilingCounts")
  )
  return snap.exists() ? (snap.data() as Record<string, number>) : {}
}

async function fetchClientFilingCounts(): Promise<Record<string, number>> {
  const snap = await getDoc(
    doc(firestore, LOBBYING_STATS_COLLECTION, "clientFilingCounts")
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
  return useAsync(fetchLobbyingBillSummaries, [court])
}

// For one session: each client's in-house filers (entityNameNorms of its own
// staff, or the client filing for itself), keyed by clientNameNorm. Clients
// with no in-house filer are absent.
export async function fetchInHouseFilers(
  court: number
): Promise<Record<string, string[]>> {
  const snap = await getDoc(
    doc(firestore, LOBBYING_STATS_COLLECTION, `inHouseFilers_${court}`)
  )
  return snap.exists() ? (snap.data() as Record<string, string[]>) : {}
}

export function useLobbyingInHouseFilers(court: number) {
  return useAsync(fetchInHouseFilers, [court])
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

async function fetchClientSummary(
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

export function useLobbyingClientSummary(clientNameNorm: string) {
  return useAsync(fetchClientSummary, [clientNameNorm])
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

export async function fetchBillRows(court: number): Promise<BillRow[]> {
  const summaries = await fetchLobbyingBillSummaries(court)
  return Object.entries(summaries).map(([billId, e]) => ({
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
    orgNeutral: e.orgNeutral ?? 0,
    orgLatestSupport: e.orgLatestSupport ?? 0,
    orgLatestOppose: e.orgLatestOppose ?? 0,
    orgLatestNeutral: e.orgLatestNeutral ?? 0,
    orgLatestMultiple: e.orgLatestMultiple ?? 0
  }))
}

// Reads through the CDN-cached API route rather than Firestore directly, and
// keeps each session's rows for the life of the page so changing the selected
// sessions doesn't refetch them.
const billRowsBySession = new Map<number, Promise<BillRow[]>>()

function fetchCachedBillRows(court: number): Promise<BillRow[]> {
  let rows = billRowsBySession.get(court)
  if (!rows) {
    rows = fetch(`/api/lobbying/bills/${court}`).then(res => {
      if (!res.ok) throw new Error(`Failed to load bills for session ${court}`)
      return res.json() as Promise<BillRow[]>
    })
    // Let a failed request be retried.
    rows.catch(() => billRowsBySession.delete(court))
    billRowsBySession.set(court, rows)
  }
  return rows
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

// Precomputed list docs written by compute_stats, so the list pages' API
// routes read one document instead of every summary: lobbyingMeta/
// clientList_{court} and clientList_all, and firmList_{court} (no
// all-sessions lobbyist doc: it would pass Firestore's 1 MiB limit). Each is a
// map keyed by the normalized name.
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

export type FirmListEntry = Pick<
  FirmListRow,
  | "regType"
  | "years"
  | "totalFilings"
  | "lobbyists"
  | "employers"
  | "hasFilings"
> & {
  name: string
  // For the doc's session.
  clientCount: number
  filings: number
}

export type ClientListRow = {
  clientName: string
  clientNameNorm: string
  totalCompensation: number | null
  registrantCount: number
  totalFilings: number | null
  inHouseCount: number | null
  individuals: number | null
  inHouseLobbyists: number | null
  hiredFirms: number | null
  courts: NonNullable<ClientSummaryRow["courts"]>
}

export async function fetchClientListRows(): Promise<ClientListRow[]> {
  const [summaries, filingCounts] = await Promise.all([
    fetchClientSummaries(),
    fetchClientFilingCounts()
  ])
  return summaries.map(c => ({
    clientName: c.clientName,
    clientNameNorm: c.clientNameNorm,
    totalCompensation: c.totalCompensation ?? null,
    registrantCount: c.registrantCount,
    totalFilings: filingCounts[c.clientNameNorm] ?? null,
    inHouseCount: c.inHouseCount ?? null,
    individuals: c.individuals ?? null,
    inHouseLobbyists: c.inHouseLobbyists ?? null,
    hiredFirms: c.hiredFirms ?? null,
    courts: c.courts ?? {}
  }))
}
