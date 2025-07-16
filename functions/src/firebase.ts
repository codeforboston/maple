import { initializeApp, App } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"
import {
  getFirestore,
  Timestamp,
  FieldValue,
  FieldPath,
  DocumentData,
  QueryDocumentSnapshot,
  DocumentSnapshot,
  QuerySnapshot
} from "firebase-admin/firestore"
import { getStorage } from "firebase-admin/storage"

export const app: App = initializeApp()
export const db = getFirestore(app)
export const storage = getStorage(app)
export const auth = getAuth(app)

// Gotta use the same Timestamp class as the admin package.
export { Timestamp, FieldValue, FieldPath }
export type {
  DocumentData,
  QueryDocumentSnapshot,
  DocumentSnapshot,
  QuerySnapshot
}

// Extreme hack to extract the File type from the admin storage package.
export type File = ReturnType<
  ReturnType<ReturnType<typeof getStorage>["bucket"]>["file"]
>
