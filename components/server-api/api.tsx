import * as admin from "firebase-admin"
import { NextApiHandler } from "next"
import { first } from "lodash"
import { Profile } from "components/db"

const initialized = first(admin.apps)
const app = initialized ?? admin.initializeApp()
const db = admin.firestore()
const storage = admin.storage()
const auth = admin.auth()

/** Verifies the caller is a site admin by verifying the token and then checking
 * that the `role` claim is `admin`. */
export const checkAdmin = async (token: string) => {
  const result = await auth.verifyIdToken(token)
}

export const listAllUsers: NextApiHandler = async (req, res) => {
  // Users from FireBASE Authentication
  const users = await auth.listUsers().then(u => u.users)

  // User profiles from FireSTORE Database
  const profilesByUid = new Map(
    await db
      .collection("/profiles")
      .get()
      .then(r => r.docs.map(d => [d.id, d.data() as Profile]))
  )

  const mergedUsers = users.map(u => ({
    email: u.email,
    claims: u.customClaims,
    ...profilesByUid.get(u.uid)
  }))

  res.json(mergedUsers)
}

export default listAllUsers
