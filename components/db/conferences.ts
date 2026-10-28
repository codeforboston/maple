import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  where
} from "firebase/firestore"
import type { Conference } from "../../functions/src/conferences/types"
import { firestore } from "../firebase"

export type { Conference } from "../../functions/src/conferences/types"

const conferences = (court: number) =>
  collection(firestore, `/generalCourts/${court}/conferences`)

export async function listConferences(court: number) {
  // Unordered: every caller sorts by activity.
  const snap = await getDocs(conferences(court))
  return snap.docs.map(d => d.data() as Conference)
}

export async function getConference(court: number, id: string) {
  const snap = await getDoc(doc(conferences(court), id))
  return snap.data() as Conference | undefined
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

/** The conference a hearing belongs to, by the event document id
 * (`hearing-{EventId}`). Conference hearings carry no bill numbers, so this is
 * the only way from a hearing to its bills. */
export async function getConferenceForHearing(
  court: number,
  hearingId: string
) {
  const snap = await getDocs(
    query(
      conferences(court),
      where("hearingIds", "array-contains", hearingId),
      limit(1)
    )
  )
  return snap.docs[0]?.data() as Conference | undefined
}
