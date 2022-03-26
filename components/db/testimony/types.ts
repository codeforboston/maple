import { Timestamp } from "firebase/firestore"
import { httpsCallable } from "firebase/functions"
import { functions } from "../../firebase"

export type BaseTestimony = {
  billId: string
  court: number
  position: "endorse" | "oppose" | "neutral"
  content: string
}

/** Draft testimony */
export type DraftTestimony = BaseTestimony & {
  publishedVersion?: number
}

/** Published testimony */
export type Testimony = BaseTestimony & {
  authorUid: string
  authorDisplayName: string
  version: number
  publishedAt: Timestamp
}

export type WithId<T> = { id: string; value: T }

export const deleteTestimony = httpsCallable<
  { publicationId: string },
  { deleted: boolean }
>(functions, "deleteTestimony")

export const publishTestimony = httpsCallable<
  { draftId: string },
  { publicationId: string }
>(functions, "publishTestimony")
