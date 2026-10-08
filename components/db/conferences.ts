import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where
} from "firebase/firestore"
import { useMemo } from "react"
import { useAsync } from "react-async-hook"
import type { Conference } from "../../functions/src/conferences/types"
import { firestore } from "../firebase"
import { loadDoc } from "./common"

export type { Conference } from "../../functions/src/conferences/types"

const conferences = (court: number) =>
  collection(firestore, `/generalCourts/${court}/conferences`)

export async function getConference(
  court: number,
  id: string
): Promise<Conference | undefined> {
  const conference = await loadDoc(`/generalCourts/${court}/conferences/${id}`)
  return conference as Conference | undefined
}

export async function listConferences(court: number) {
  const snap = await getDocs(query(conferences(court), orderBy("title")))
  return snap.docs.map(d => d.data() as Conference)
}

/** A conference references its two bills; nothing on a bill points back. So
 * "is this bill in conference" is a query here, not a field there. */
export async function getConferenceForBill(court: number, billId: string) {
  // A bill id carries its chamber: S#### is a Senate bill, H#### a House bill.
  const field = billId.startsWith("S") ? "senateBillId" : "houseBillId"
  const snap = await getDocs(
    query(conferences(court), where(field, "==", billId), limit(1))
  )
  return snap.docs[0]?.data() as Conference | undefined
}

export function useConference(court: number, id: string) {
  const { result, loading } = useAsync(getConference, [court, id])
  return useMemo(() => ({ conference: result, loading }), [loading, result])
}

export function useConferenceForBill(court: number, billId: string) {
  const { result, loading } = useAsync(getConferenceForBill, [court, billId])
  return useMemo(() => ({ conference: result, loading }), [loading, result])
}
