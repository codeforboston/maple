import { UserRecord } from "firebase-admin/lib/auth/user-record"
import * as functions from "firebase-functions"
import { auth, db } from "../firebase"
import { Profile } from "../profile/types"
import { Auth, Database } from "../types"
import { Claim, Role } from "./types"

export const createAdmin = functions.https.onRequest(
  async (request, response) => {
    const { uid } = request.query

    if (uid && typeof uid === "string") {
      try {
        setRoleAdmin({ uid, auth, db })

        const user = await auth.getUser(uid as string)

        response.status(200).json({
          data: user
        })
      } catch (e) {
        response.status(500).json(e)
      }

      response.status(500).end()
      return
    }
  }
)

export const setRoleAdmin = async ({
  uid,
  auth,
  db
}: {
  uid?: string
  auth: Auth
  db: Database
}) => {
  let user: UserRecord
  if (uid) user = await auth.getUser(uid)
  else throw Error("Missing uid or email")

  const role: Role = "admin"
  const claim: Claim = { role }
  await auth.setCustomUserClaims(user.uid, claim)

  const profile = db.doc(`/profiles/${user.uid}`)
  const profileUpdate: Partial<Profile> = {
    role
  }
  await profile.set(profileUpdate, { merge: true })
}
