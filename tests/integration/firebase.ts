import * as admin from "firebase-admin"

if (admin.apps.length === 0) {
  admin.initializeApp()
}
export const db = admin.firestore()
export const storage = admin.storage()
export const auth = admin.auth()
export { admin }

export const Timestamp = admin.firestore.Timestamp
export type Timestamp = admin.firestore.Timestamp
