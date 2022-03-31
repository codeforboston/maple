import * as functions from "firebase-functions"
import { db } from "./firebase"

export const setUsername = functions.auth.user().onCreate(async user => {
  if (user.displayName) {
    await db.doc(`/profiles/${user.uid}`).set({ displayName: user.displayName })
  }
})
