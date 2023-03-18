import admin from 'firebase-admin';
import {first} from "lodash";

const initialized = first(admin.apps);
const app = initialized ?? admin.initializeApp()
export const db = admin.firestore()
export const auth = admin.auth()
