import { FirebaseOptions, initializeApp } from "firebase/app"
import { connectAuthEmulator, getAuth } from "firebase/auth"
import {
  connectFirestoreEmulator,
  initializeFirestore
} from "firebase/firestore"
import { connectFunctionsEmulator, getFunctions } from "firebase/functions"
import { connectStorageEmulator, getStorage } from "firebase/storage"

// It's OK to check in the dev keys since they're bundled into the client and it
// makes it easier to contribute.
const projectId =
  process.env.NEXT_PUBLIC_PROJECT_ID_FOR_TEST ?? "digital-testimony-dev"
const devConfig = {
  apiKey: "AIzaSyDtqmwBWy-uM-ycTczU8Bt0scM7Pa7MBYo",
  authDomain: "digital-testimony-dev.firebaseapp.com",
  projectId,
  storageBucket: `${projectId}.appspot.com`,
  messagingSenderId: "313437920642",
  appId: "1:313437920642:web:42723233282dbcac37439b"
}

const config: FirebaseOptions = process.env.NEXT_PUBLIC_FIREBASE_CONFIG
  ? JSON.parse(process.env.NEXT_PUBLIC_FIREBASE_CONFIG)
  : devConfig

export const app = initializeApp(config)
export const firestore = initializeFirestore(app, {
  ignoreUndefinedProperties: true
})
export const auth = getAuth(app)
export const storage = getStorage(app)
export const functions = getFunctions(app)

if (process.env.NODE_ENV !== "production") {
  const useEmulator = process.env.NEXT_PUBLIC_USE_EMULATOR
  switch (useEmulator) {
    case "1":
    case "true":
      connectEmulators()
      break
    case "0":
    case "false":
    case "":
    case undefined:
      break
    default:
      throw Error("Unsupported emulator option " + useEmulator)
  }
}

/** Connect emulators according to `firebase.json` */
function connectEmulators() {
  connectFirestoreEmulator(firestore, "localhost", 8080)
  connectFunctionsEmulator(functions, "localhost", 5001)
  connectStorageEmulator(storage, "localhost", 9199)
  connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true })
  if (process.env.NODE_ENV === "development")
    console.log("Connected to emulators")
}
