import * as admin from "firebase-admin"
import { deleteApp } from "firebase/app"
import { clearIndexedDbPersistence, terminate } from "firebase/firestore"
import { app, firestore } from "../components/firebase"

admin.initializeApp({
  storageBucket: `${process.env.GCLOUD_PROJECT}.appspot.com`
})

export const testDb = admin.firestore()
export const testStorage = admin.storage()
export const testAuth = admin.auth()

export const testTimestamp = admin.firestore.Timestamp
export { admin as testAdmin }

export async function terminateFirebase() {
  await deleteApp(app)
  await terminate(firestore)
  await clearIndexedDbPersistence(firestore)
  // Despite the above calls to teardown firebase resources, Jest still
  // complains about unstopped async operations. Adding a 3 second pause fixes
  // the warning but increases test time. Firebase eventually does exit, but the
  // above promises resolve before that occurs. So just live with the warning
  // and let firebase clean itself up.
  //
  await new Promise(r => setTimeout(r, 3000))

  // Clean up the admin interface
  await testDb.terminate()
  await admin.firestore().terminate()
}
