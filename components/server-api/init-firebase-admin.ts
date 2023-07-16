import admin from "firebase-admin"
import { first } from "lodash"
import { runAgainstEmulators } from "scripts/configure"

// Initialize the Firebase Admin SDK
const initialized = first(admin.apps)
if (
  !initialized &&
  process.env.NODE_ENV !== "production" &&
  process.env.NEXT_PUBLIC_USE_EMULATOR
) {
  runAgainstEmulators()
}

let app: admin.app.App
if (initialized) {
  app = initialized
} else {
  // Get the service account key JSON data from the environment variable
  const serviceAccount = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON

  const init: any = {}
  if (serviceAccount) {
    init.credential = admin.credential.cert(JSON.parse(serviceAccount))
  }
  app = admin.initializeApp(init)
}

console.log("init-firebase-admin.ts: initialized", initialized)

export const db = app.firestore()
export const auth = app.auth()
