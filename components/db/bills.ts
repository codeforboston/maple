import { collection, getDocs, limit, orderBy, where } from "firebase/firestore"
import { useAsync } from "react-async-hook"
import { firestore } from "../firebase"
import { loadDoc, midnight, nullableQuery } from "./common"
import { currentGeneralCourt } from "common/constants"
import { Bill } from "common/bills/types"

export function useBill(court: number, id: string) {
  return useAsync(getBill, [court, id])
}

export async function getBill(
  court: number,
  id: string
): Promise<Bill | undefined> {
  const bill = await loadDoc(`/generalCourts/${court}/bills/${id}`)
  return bill as any
}

export async function listBillsByHearingDate(
  limitCount: number
): Promise<Bill[]> {
  const billsRef = collection(
    firestore,
    `/generalCourts/${currentGeneralCourt}/bills`
  )
  const result = await getDocs(
    nullableQuery(
      billsRef,
      where("nextHearingAt", ">=", midnight()),
      orderBy("nextHearingAt", "asc"),
      limit(limitCount)
    )
  )
  return result.docs.map(d => d.data() as Bill)
}
