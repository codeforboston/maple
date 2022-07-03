import * as functions from "firebase-functions"
import { db } from "../firebase"
import { Profile } from "./types"

export const createProfile = functions.auth.user().onCreate(async user => {
  const profile: Profile = { auth: { role: "user" }, public: false }
  if (user.displayName) profile.displayName = user.displayName
  await db.doc(`/profiles/${user.uid}`).set(profile, { merge: true })
})
