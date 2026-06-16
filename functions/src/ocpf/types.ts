import { Timestamp } from "../firebase"

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
}