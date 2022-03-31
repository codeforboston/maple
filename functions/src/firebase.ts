import * as admin from "firebase-admin"

admin.initializeApp()
export const db = admin.firestore()
export const storage = admin.storage()
export const auth = admin.auth()
export { admin }
// Gotta use the same Timestamp class as the admin package.
export const Timestamp = admin.firestore.Timestamp
export type Timestamp = admin.firestore.Timestamp
export const FieldValue = admin.firestore.FieldValue
export type FieldValue = admin.firestore.FieldValue
