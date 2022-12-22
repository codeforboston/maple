import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { firestore } from "components/firebase"
import {
  collectionGroup,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  where
} from "firebase/firestore"
import { first } from "lodash"
import { Bill } from "./bills"
import { Profile } from "./profile"
import { Testimony } from "./testimony"

export type TestimonyQuery = {
  authorUid: string
  billId: string
  court: number
}

export type BillQuery = {
  billId: string
  court: number
}

export type PublicProfileQuery = {
  uid: string
}

export class DbService {
  private getDocData = async <T>(path: string, ...pathSegments: string[]) => {
    const snap = await getDoc(doc(firestore, path, ...pathSegments))
    if (snap.exists()) return snap.data() as T
  }

  getPublishedTestimony = async ({
    authorUid,
    billId,
    court
  }: TestimonyQuery) => {
    await this.getDocData<Testimony>(
      "users",
      authorUid,
      "publishedTestimony",
      billId
    )

    const result = await getDocs(
      query(
        collectionGroup(firestore, "publishedTestimony"),
        where("authorUid", "==", authorUid),
        where("billId", "==", billId),
        where("court", "==", court),
        limit(1)
      )
    )
    const snap = first(result.docs)
    if (snap?.exists()) return snap.data() as Testimony
  }

  getBill = ({ court, billId }: BillQuery) =>
    this.getDocData<Bill>("generalCourts", court.toString(), "bills", billId)

  getPublicProfile = async ({ uid }: PublicProfileQuery) => {
    try {
      const profile = await this.getDocData<Profile>(`/profiles`, uid)
      return profile && { ...profile, uid }
    } catch (e) {
      // Existing private profiles cause a permission-denied error
      return undefined
    }
  }
}

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery(),
  endpoints: () => ({})
})
