import admin from 'firebase-admin';
import {first} from "lodash";

Object.assign(process.env, {
  NEXT_PUBLIC_PROJECT_ID_FOR_TEST: "demo-dtp",
  GCLOUD_PROJECT: "demo-dtp",
  NEXT_PUBLIC_USE_EMULATOR: "true",
  FIRESTORE_EMULATOR_HOST: "localhost:8080",
  FIREBASE_AUTH_EMULATOR_HOST: "localhost:9099",
  FIREBASE_STORAGE_EMULATOR_HOST: "localhost:9199",
  TYPESENSE_API_URL: "http://localhost:8108",
  TYPESENSE_API_KEY: "test-api-key"
})

const initialized = first(admin.apps);
const app = initialized ?? admin.initializeApp()
export const db = admin.firestore()
export const auth = admin.auth()
