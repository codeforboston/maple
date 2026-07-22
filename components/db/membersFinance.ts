import { Timestamp } from "firebase/firestore"
import { useMemo } from "react"
import { useAsync } from "react-async-hook"
import { loadDoc } from "./common"

// Mirror of functions/src/ocpf/types.ts MembersFinance, using client-side Timestamp
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
  loans: FinanceBreakdownEntry
  contributions: FinanceBreakdownEntry
}

export interface MembersFinanceInKind {
  individual: FinanceBreakdownEntry
  committee: FinanceBreakdownEntry
  union: FinanceBreakdownEntry
  unitemized: { amount: number }
}

export interface MembersFinanceOtherReceipts {
  nonContribution: FinanceBreakdownEntry
}

export interface MembersFinanceYearData {
  totalRaised: number
  totalSpent: number
  breakdown: MembersFinanceBreakdown
  finalized: boolean
}

export interface MembersFinance {
  ocpfCpfId: number
  totalRaised: number
  totalSpent: number
  cashOnHand: number
  contributorCount: number
  lastUpdated: Timestamp
  // End_Date of the most recent Bank Report (type 70) — the basis for totalRaised/cashOnHand.
  bankDataAsOf?: Timestamp
  // End_Date of the most recent Deposit Report (type 60) — the basis for the
  // breakdown categories. Normally later than bankDataAsOf, since Deposit
  // Reports are filed more frequently than Bank Reports.
  depositDataAsOf?: Timestamp
  breakdown: MembersFinanceBreakdown
  candidateFunds: MembersFinanceCandidateFunds
  inKind: MembersFinanceInKind
  otherReceipts: MembersFinanceOtherReceipts
  years: Record<string, MembersFinanceYearData>
}

export function useMembersFinance(court: number, memberId?: string) {
  const { loading, result, error } = useAsync(getFinance, [court, memberId])
  return useMemo(
    () => ({ finance: result, loading, error }),
    [loading, result, error]
  )
}

async function getFinance(
  court: number,
  memberId?: string
): Promise<MembersFinance | undefined> {
  if (!memberId) return undefined
  const data = await loadDoc(
    `/generalCourts/${court}/membersFinance/${memberId}`
  )
  return data as MembersFinance | undefined
}
