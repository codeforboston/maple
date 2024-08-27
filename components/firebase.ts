import * as analytics from "firebase/analytics"
import { FirebaseOptions, getApps, initializeApp } from "firebase/app"
import { connectAuthEmulator, getAuth, initializeAuth } from "firebase/auth"
import {
  connectFirestoreEmulator,
  getFirestore,
  initializeFirestore
} from "firebase/firestore"
import { connectFunctionsEmulator, getFunctions } from "firebase/functions"
import { connectStorageEmulator, getStorage } from "firebase/storage"
import { first } from "lodash"
import { useEffect, useMemo, useState } from "react"
import { createService } from "./service"

// Necessary for compatibility with react admin firebase
// https://github.com/benwinding/react-admin-firebase/issues/225
import firebase from "firebase/compat/app"
import "firebase/compat/auth"
import "firebase/compat/functions"
import "firebase/compat/storage"
import "firebase/compat/firestore"

// It's OK to check in the dev keys since they're bundled into the client and it
// makes it easier to contribute.
const projectId =
  process.env.NEXT_PUBLIC_PROJECT_ID_FOR_TEST ?? "digital-testimony-dev"
const devConfig = {
  apiKey: "AIzaSyDtqmwBWy-uM-ycTczU8Bt0scM7Pa7MBYo",
  authDomain: `${projectId}.firebaseapp.com`,
  projectId,
  storageBucket: `${projectId}.appspot.com`,
  messagingSenderId: "313437920642",
  appId: "1:313437920642:web:42723233282dbcac37439b",
  measurementId: "G-R81R1WLMXY"
}

const config: FirebaseOptions = process.env.NEXT_PUBLIC_FIREBASE_CONFIG
  ? JSON.parse(process.env.NEXT_PUBLIC_FIREBASE_CONFIG)
  : devConfig

const initialized = first(firebase.apps)

export const app = initialized ?? firebase.initializeApp(config)
export { getApps }
export const getAnalytics = (() => {
  let value: undefined | null | analytics.Analytics
  return async () => {
    if (value === undefined) {
      if (
        process.env.NODE_ENV === "production" &&
        (await analytics.isSupported())
      ) {
        value = analytics.getAnalytics(app)
      } else {
        value = null
      }
    }
    return value
  }
})()

export const { Provider } = createService(() => {
  useEffect(() => {
    getAnalytics().catch(e =>
      console.warn("Failed to initialized Firebase analytics", e)
    )
  }, [])
})

export const firestore = initialized
  ? getFirestore()
  : initializeFirestore(app, {
      ignoreUndefinedProperties: true
    })
export const auth = getAuth()
export const storage = getStorage()
export const functions = getFunctions()

if (!initialized && process.env.NODE_ENV !== "production") {
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
  const host =
    process.env.NEXT_PUBLIC_EMULATOR_HOST ?? typeof window === "undefined"
      ? "firebase"
      : "127.0.0.1"
  connectFirestoreEmulator(firestore, host, 8080)
  connectFunctionsEmulator(functions, host, 5001)
  connectStorageEmulator(storage, host, 9199)
  connectAuthEmulator(auth, `http://${host}:9099`, { disableWarnings: true })

  if (process.env.NODE_ENV === "development")
    console.log("Connected to emulators")
}

if (typeof window !== "undefined") {
  Object.assign(window as any, { auth, app, getApps })
}
