import {
  Array,
  Dictionary,
  InstanceOf,
  Literal,
  Number,
  Null,
  Record,
  Static,
  String,
  Union
} from "runtypes"
import { Timestamp } from "../firebase"

export type LobbyingChamber = Static<typeof LobbyingChamber>
export const LobbyingChamber = Union(
  Literal("House Bill"),
  Literal("Senate Bill"),
  Literal("House Docket"),
  Literal("Senate Docket"),
  Literal("Executive"),
  Literal("Other")
)

export type LobbyingClient = Static<typeof LobbyingClient>
export const LobbyingClient = Record({
  clientName: String,
  clientNameNorm: String,
  compensation: Null.Or(Number)
})

export type LobbyingRegistrant = Static<typeof LobbyingRegistrant>
export const LobbyingRegistrant = Record({
  registrantId: String,
  entityName: String,
  entityNameNorm: String,
  year: Number,
  generalCourt: Number,
  regType: Union(Literal("Lobbyist"), Literal("Employer")),
  clients: Array(LobbyingClient),
  legacyTotalCompensation: Null.Or(Number),
  disclosureUrls: Array(String),
  fetchedAt: InstanceOf(Timestamp)
})

export type LobbyingFiling = Static<typeof LobbyingFiling>
export const LobbyingFiling = Record({
  filingId: String,
  // ID of the parent lobbyingRegistrants document — enables indexed queries
  // by firm without a string-equality scan on entityName.
  registrantId: String,
  entityName: String,
  entityNameNorm: String,
  clientName: String,
  clientNameNorm: String,
  year: Number,
  generalCourt: Number,
  chamber: LobbyingChamber,
  // Non-null only for legislative chambers (House Bill, Senate Bill, House Docket,
  // Senate Docket). For Executive and Other, no bill join should be attempted.
  billId: Null.Or(String),
  activityTitle: String,
  position: String,
  amount: Null.Or(Number),
  fetchedAt: InstanceOf(Timestamp)
})

// ── Pre-computed aggregates ───────────────────────────────────────────────────

export type LobbyingPositionCounts = Static<typeof LobbyingPositionCounts>
export const LobbyingPositionCounts = Record({
  support: Number,
  oppose: Number,
  neutral: Number,
  none: Number
})

/**
 * Singleton document written by the ingest pipeline after each scrape run.
 * Stored at /lobbyingStats (top-level document, no collection).
 * Avoids expensive client-side fan-out on the Lobbying Explorer overview page.
 */
export type LobbyingStats = Static<typeof LobbyingStats>
export const LobbyingStats = Record({
  totalFilings: Number,
  totalRegistrants: Number,
  totalClients: Number,
  totalBillsWithFilings: Number,
  courtsWithData: Array(Number),
  spendByYear: Dictionary(Number),
  filingsByYear: Dictionary(Number)
})

/**
 * One document per unique client/sponsor in the lobbyingClients collection.
 * Written by the ingest pipeline; enables paginated client browse without
 * scanning the full lobbyingFilings collection.
 */
export type LobbyingClientSummary = Static<typeof LobbyingClientSummary>
export const LobbyingClientSummary = Record({
  clientSlug: String,
  clientName: String,
  clientNameNorm: String,
  totalFilings: Number,
  totalAmount: Null.Or(Number),
  years: Array(Number),
  generalCourts: Array(Number),
  positionCounts: LobbyingPositionCounts,
  registrantIds: Array(String)
})

/** Firestore path for the pre-computed stats singleton: collection/docId */
export const LOBBYING_STATS_COLLECTION = "lobbyingMeta"
export const LOBBYING_STATS_DOC_ID = "stats"

export const CLIENTS_COLLECTION = "lobbyingClients"

/** Firestore path for lobbying registrant documents */
export const REGISTRANTS_COLLECTION = "lobbyingRegistrants"

/** Firestore path for lobbying filing documents */
export const FILINGS_COLLECTION = "lobbyingFilings"

/** Firestore path for the live scraper cursor document */
export const SCRAPER_DOC = "/scrapers/lobbying"

/** Firestore path for the backfill cursor subcollection */
export const BACKFILL_DOC = "/scrapers/lobbyingBackfill"
export const BACKFILL_URLS_COLLECTION = "processedUrls"

/** Earliest year with portal data */
export const FIRST_LOBBYING_YEAR = 2005

/**
 * Sentinel clientName used for pre-2013 legacy filings where compensation is
 * reported as a single total rather than broken down per client.
 */
export const LEGACY_TOTAL_CLIENT = "_total_salary_"

/**
 * Chamber prefix map for constructing billId values that match MAPLE's Bill.id.
 * Typed as a plain index signature so portal.ts can look up any LobbyingChamber
 * without triggering "Property X does not exist" on the Partial.
 */
export const CHAMBER_PREFIXES: { [chamber: string]: string | undefined } = {
  "House Bill": "H",
  "Senate Bill": "S",
  "House Docket": "HD",
  "Senate Docket": "SD"
}

/** Canonical chamber values for legacy short-form codes found in older filings */
export const LEGACY_CHAMBER_MAP: { [raw: string]: LobbyingChamber } = {
  HB: "House Bill",
  SB: "Senate Bill"
}
