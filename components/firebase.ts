import { FirebaseOptions, initializeApp } from "firebase/app"
import { getAuth, connectAuthEmulator } from "firebase/auth"
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore"
import { getFunctions, connectFunctionsEmulator } from "firebase/functions"

// It's OK to check in these keys since they're bundled into the client and it
// makes it easier to contribute.
//
// TODO: Replace with production config before v2 release. Do not check in
// production config.
const config: FirebaseOptions = {
  apiKey: "AIzaSyDtqmwBWy-uM-ycTczU8Bt0scM7Pa7MBYo",
  authDomain: "digital-testimony-dev.firebaseapp.com",
  projectId: "digital-testimony-dev",
  storageBucket: "digital-testimony-dev.appspot.com",
  messagingSenderId: "313437920642",
  appId: "1:313437920642:web:42723233282dbcac37439b"
}

if (process.env.NEXT_PUBLIC_PROJECT_ID) {
  config.projectId = process.env.NEXT_PUBLIC_PROJECT_ID
}

export const app = initializeApp(config)
export const auth = getAuth(app)
export const firestore = getFirestore(app)
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
  connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true })
  console.log("Connected to emulators")
}
