import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { firestore } from "components/firebase"
import { isNotNull } from "components/utils"
import { useMemo } from "react"
import { FirebaseError } from "firebase/app"
import {
  collection,
  collectionGroup,
  doc,
  getDoc as getFbDoc,
  getDocs as getFbDocs,
  limit,
  orderBy,
  query,
  where,
  Query
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

export type ProfileQuery = {
  uid: string
}

export type UserProfile = Profile & { uid: string }

const handleFailure = (name: string, e: any, ...json: any) => {
  if (e instanceof FirebaseError)
    console.error(name, ...json.map((s: any) => JSON.stringify(s, null, 2)), e)
  throw e
}

export const dbService = (() => {
  let service: DbService | undefined
  return () => {
    if (!service) service = new DbService()
    return service
  }
})()

export class DbService {
  private getDocs = <T>(q: Query<T>) => {
    return getFbDocs(q).catch(e => handleFailure("getDocs", e, q))
  }
  private getDocData = async <T>(path: string, ...pathSegments: string[]) => {
    const snap = await getFbDoc(doc(firestore, path, ...pathSegments)).catch(
      e => handleFailure("getDocData", e, path, pathSegments.join("/"))
    )

    if (snap.exists()) return snap.data() as T
  }

  getArchivedTestimony = async ({
    authorUid,
    billId,
    court
  }: TestimonyQuery): Promise<Testimony[]> => {
    const result = await this.getDocs(
      query(
        collection(firestore, `/users/${authorUid}/archivedTestimony`),
        where("billId", "==", billId),
        where("court", "==", court),
        orderBy("version", "desc")
      )
    )
    const archive = result.docs
      .map(snap => snap.data())
      .filter(isNotNull) as Testimony[]
    return archive
  }

  getPublishedTestimony = async ({
    publishedId
  }: {
    publishedId: string
  }): Promise<Testimony | undefined> => {
    const result = await this.getDocs(
      query(
        collectionGroup(firestore, "publishedTestimony"),
        where("id", "==", publishedId),
        limit(1)
      )
    )
    const snap = first(result.docs)
    if (snap?.exists()) return snap.data() as Testimony
  }

  getBill = ({ court, billId }: BillQuery): Promise<Bill | undefined> =>
    this.getDocData<Bill>("generalCourts", court.toString(), "bills", billId)

  getHearing = (hearingId: number): any => {
    const hearingQuery = `hearing-${hearingId}`
    this.getDocData<string>("events", hearingQuery)
  }

  getProfile = async ({
    uid
  }: ProfileQuery): Promise<UserProfile | undefined> => {
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
  endpoints: () => ({}),
  tagTypes: ["Bill", "Testimony", ""]
})

export class ApiResponse {
  static notFound = (message = "Resource not found") => ({
    error: { status: 404, data: message }
  })
  static ok = <T>(data: T) => ({ data })
}
