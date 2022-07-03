import * as functions from "firebase-functions"
import { Role } from "./auth"
import { db } from "./firebase"

export type Profile = {
  displayName?: string
  /** Role is unset for legacy accounts and before the creation hook runs. */
  role?: Role
}

export const createProfile = functions.auth.user().onCreate(async user => {
  const profile: Profile = { role: "user" }
  if (user.displayName) profile.displayName = user.displayName
  await db.doc(`/profiles/${user.uid}`).set(profile, { merge: true })
})
