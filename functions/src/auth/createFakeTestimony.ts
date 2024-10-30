import { checkAdmin, checkAuth } from "../common"
import { auth, db } from "../firebase"
import { Testimony } from "../testimony/types"
import { Timestamp } from "../firebase"
import { onCall } from "firebase-functions/v2/https"

// for populating admin module for testing & demonstration--alert--no auth checked here.
//@TODO: remove

export const createFakeTestimony = onCall(async request => {
  console.log("running fake testimony")
  checkAuth(request, false)
  checkAdmin(request)

  const { uid, fullName, email } = request.data

  const author = {
    uid,
    fullName,
    email,
    password: "password",
    public: true,
    role: "user"
  }

  await auth.createUser({ uid })

  await db.doc(`profiles/${uid}`).set(author)

  const id = `${uid}ttmny`

  const testimony: Testimony = {
    id,
    authorUid: author.uid,
    authorDisplayName: "none",
    authorRole: "user",
    billTitle: "An act",
    version: 2,
    billId: "H1002",
    publishedAt: Timestamp.now(),
    court: 192,
    position: "oppose",
    fullName: fullName,
    content: fullName + " " + fullName + " " + fullName + " " + fullName,
    public: true,
    updatedAt: Timestamp.now()
  }

  const testRef = db.doc(`users/${uid}/publishedTestimony/${id}`)

  await testRef.set(testimony)

  return { uid: uid, tid: id }
})
