import * as admin from "firebase-admin"

admin.initializeApp()
export const db = admin.firestore()
export const storage = admin.storage()
export const auth = admin.auth()
export { admin }

export const FieldValue = admin.firestore.FieldValue
export type FieldValue = admin.firestore.FieldValue
export const FieldPath = admin.firestore.FieldPath
export type FieldPath = admin.firestore.FieldPath
export type DocumentData = admin.firestore.DocumentData
export type QueryDocumentSnapshot = admin.firestore.QueryDocumentSnapshot
export type DocumentSnapshot = admin.firestore.DocumentSnapshot
export type QuerySnapshot = admin.firestore.QuerySnapshot

// Extreme hack to extract the File type from the admin storage package. For
// some reason admin.storage does not resolve the storage namespace, as
// admin.firestore does.
export type File = ReturnType<
  ReturnType<ReturnType<typeof admin.storage>["bucket"]>["file"]
>
