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
  smallDonors?: {
    itemized: FinanceBreakdownEntry
  }
  // type 319 — payment-processor fees deducted between the gross Deposit
  // Report amount (reflected in individual/committee/union above) and the
  // net Bank Report amount (reflected in totalRaised). Not a contribution
  // category; used only to explain the gap between the two on the frontend.
  processingFees?: FinanceBreakdownEntry
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

export interface MembersFinanceOtherReceipts {
  nonContribution: FinanceBreakdownEntry // type 204
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
  totalRaised: number
  totalSpent: number
  cashOnHand: number
  contributorCount: number // count of type-201 rows (row = one itemized contribution)
  lastUpdated: FirebaseFirestore.Timestamp
  // End_Date of the most recent Bank Report (type 70) — the basis for totalRaised/cashOnHand.
  bankDataAsOf?: FirebaseFirestore.Timestamp
  // End_Date of the most recent Deposit Report (type 60) — the basis for the
  // breakdown categories. Normally later than bankDataAsOf, since Deposit
  // Reports are filed more frequently than Bank Reports.
  depositDataAsOf?: FirebaseFirestore.Timestamp
  breakdown: MembersFinanceBreakdown
  candidateFunds: MembersFinanceCandidateFunds
  inKind: MembersFinanceInKind
  otherReceipts: MembersFinanceOtherReceipts
  years: Record<string, MembersFinanceYearData>
}
