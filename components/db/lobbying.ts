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
