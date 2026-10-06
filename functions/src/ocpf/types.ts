// One active filer row parsed from ocpf-filers.txt
export interface OcpfFilerRow {
  cpfId: number
  lastName: string
  firstName: string
  officeSought: string // "Senate" | "House"
  district: string
  closedDate: string // empty string = active
}

// Firestore: /config/ocpfMemberMapping
// memberCode → { cpfId, name }, e.g. { "SND1": { cpfId: 15031, name: "Sal N. DiDomenico" } }
export interface OcpfMemberMappingEntry {
  cpfId: number
  name: string
}

export type OcpfMemberMapping = Record<string, OcpfMemberMappingEntry>

export interface OcpfMemberMappingFlagsEntry {
  memberCode: string
  name: string
}

// Firestore: /config/ocpfMemberMappingFlags
export interface OcpfMemberMappingFlags {
  unmatched: OcpfMemberMappingFlagsEntry[]
  ambiguous: OcpfMemberMappingFlagsEntry[]
}

export interface FinanceBreakdownEntry {
  count: number
  amount: number
}

export interface MembersFinanceBreakdown {
  individual: FinanceBreakdownEntry
  committee: FinanceBreakdownEntry
  union: FinanceBreakdownEntry
  unitemized: { amount: number }
  // Subset of `individual` — itemized (type 201) contributions under $200.
  // Combined with `unitemized` on the frontend for the "Small Donors" stat.
  smallDonors: {
    itemized: FinanceBreakdownEntry
  }
  // type 319 — payment-processor fees deducted between the gross Deposit
  // Report amount (reflected in individual/committee/union above) and the
  // net Bank Report amount (reflected in totalRaised). Not a contribution
  // category; used only to explain the gap between the two on the frontend.
  processingFees: FinanceBreakdownEntry
}

export interface MembersFinanceCandidateFunds {
  loans: FinanceBreakdownEntry // types 206 + 331
  contributions: FinanceBreakdownEntry // type 332
}

export interface MembersFinanceInKind {
  individual: FinanceBreakdownEntry // type 401
  committee: FinanceBreakdownEntry // type 402
  union: FinanceBreakdownEntry // type 403
  unitemized: { amount: number } // type 420
}

export interface MembersFinanceYearData {
  totalRaised: number
  totalSpent: number
  breakdown: MembersFinanceBreakdown
  finalized: boolean
}

// Firestore: /generalCourts/{court}/membersFinance/{memberCode}
export interface MembersFinance {
  ocpfCpfId: number
  // Net receipts for current 2 yr session: Receipts_Total of Bank Reports (type 70) and External
  // Activity Reports (type 13), plus candidate out-of-pocket expenses (item
  // types 331/332), minus non-contribution receipts (item type 204 —
  // refunds/misc) dated on or before bankDataAsOf.
  // Matches OCPF's own public "Receipts" definition.
  totalRaised: number
  // Expenditures_Total for current 2 yr session: Includes Bank Reports (type 70) and External Activity
  // Reports (type 13), plus candidate out-of-pocket expenses (item types
  // 331/332).
  // Matches OCPF's own public "Expenditures" definition.
  totalSpent: number
  cashOnHand: number
  // Start_Balance of the earliest Bank Report (type 70) in the tracked window,
  // i.e. cash on hand at the start of the current election cycle.
  // TODO: Surface this on the Finance tab.
  startBalance: number

  // contributionsCount and uniqueContributorsCount both cover itemized individual,
  // committee and union contributions (item types 201/202/203) across the whole election cycle, not per year.

  // count of rows (row = one itemized contribution)
  contributionsCount: number
  // Distinct contributors, matched on name + first name + 5-digit ZIP (see
  // contributorKey in scrapeOcpfFinance.ts). Small donations the campaign
  // reported only as a lump sum (Receipts_Unitemized_Total) do not have donor
  // names, so they aren't counted. Many campaigns do itemize small donations,
  // so some small contributions will count towards uniqueContributorsCount.
  // (about 79% of 2025 individual contribution rows were $50 or less).
  uniqueContributorsCount: number
  lastUpdated: FirebaseFirestore.Timestamp
  // End_Date of the most recent Bank Report (type 70) — the basis for totalRaised/cashOnHand.
  // Missing if the member has no Bank Report.
  bankDataAsOf?: FirebaseFirestore.Timestamp
  // End_Date of the most recent Deposit Report (type 60) — the basis for the
  // breakdown categories. Normally later than bankDataAsOf, since Deposit
  // Reports are filed more frequently than Bank Reports. Missing if the
  // member has no Deposit Report.
  depositDataAsOf?: FirebaseFirestore.Timestamp
  breakdown: MembersFinanceBreakdown
  candidateFunds: MembersFinanceCandidateFunds
  inKind: MembersFinanceInKind
  years: Record<string, MembersFinanceYearData>
}
