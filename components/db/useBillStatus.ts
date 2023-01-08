import { BillTracker } from "components/bill/types"
import { BillHistoryAction } from "functions/src/bills/types"
import { useEffect, useState } from "react"
import { useAsync } from "react-async-hook"
import { Bill, getBill } from "./bills"
import { loadDoc } from "./common"

export enum Stage {
  billIntroduced = "Bill Introduced",
  firstCommittee = "First Committee",
  secondCommittee = "Second Committee",
  firstChamber = "First Chamber",
  secondChamber = "Second Chamber",
  signed = "Signed By Governor"
}

export function getBillTracker(
  billId: string,
  court: number
): Promise<BillTracker | undefined> {
  return loadDoc(`/billTracker/${court}-${billId}`) as any
}

export function useBillTracker(billId: string, court: number) {
  return useAsync(getBillTracker, [billId, court])
}
