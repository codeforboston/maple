import { initializeApp } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"
import { getStorage } from "firebase-admin/storage"
import { getAuth } from "firebase-admin/auth"
import { deleteApp } from "firebase/app"
import { clearIndexedDbPersistence, terminate } from "firebase/firestore"
import { app, firestore } from "../components/firebase"
import { Timestamp } from "functions/src/firebase"

const testApp = initializeApp(
  {
    storageBucket: `${process.env.GCLOUD_PROJECT}.appspot.com`
  },
  "testApp"
)

export const testDb = getFirestore(testApp)
export const testStorage = getStorage(testApp)
export const testAuth = getAuth(testApp)

export const testTimestamp = Timestamp

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
}
