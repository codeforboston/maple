import { Role } from "components/auth"
import { publishTestimony, resolveReport } from "components/db"
import { signOut } from "firebase/auth"
import { Timestamp, doc, setDoc } from "firebase/firestore"
import { httpsCallable } from "firebase/functions"
import { db } from "functions/src/firebase"
import { currentGeneralCourt } from "functions/src/shared"
import {
  createFakeBill,
  createNewReport,
  createNewTestimony,
  expectCurrentUserAdmin,
  signInTestAdmin,
  signInUser,
  signInUser1
} from "tests/integration/common"
import { terminateFirebase, testAuth, testDb } from "tests/testUtils"
import { auth, firestore, functions } from "../../components/firebase"
import {
  expectPermissionDenied,
  genUserInfo
} from "./common"




afterAll(terminateFirebase)

type BaseTestimony = {
  billId: string
  court: number
  position: "endorse" | "oppose" | "neutral"
  content: string
  attachmentId: string | null | undefined
  editReason?: string
}

type DraftTestimony = BaseTestimony & {
  publishedVersion?: number
}

type Testimony = BaseTestimony & {
  authorUid: string
  authorDisplayName: string
  version: number
  publishedAt: Timestamp
}

const deleteTestimony = httpsCallable<
  { uid: string; publicationId: string },
  { deleted: boolean }
>(functions, "deleteTestimony")

let adminUid: string
let authorUid: string

beforeAll(async () => {
  const authorUser = await signInUser1()
  authorUid = authorUser.uid

  const adminUser = await signInTestAdmin()
  adminUid = adminUser.uid

  await db.doc(`/profiles/${adminUid}`).update({ role: "admin" })
  expect((await db.doc(`/profiles/${adminUid}`).get()).data()?.role).toEqual(
    "admin"
  )

  expect(auth.currentUser).toBeDefined()
})

describe("moderate testimony", () => {
  it("resolves report for remove-testimony", async () => {
    // set up

    const billId = await createFakeBill()
    const { tid, removeThisTestimony } =
      await createNewTestimony(authorUid, billId)
    const { reportId, getThisReport, removeThisReport } = await createNewReport(
      adminUid,
      tid
    )

    const report = await getThisReport()
    expect(report).toBeDefined()
    expect(report?.reason).toBeDefined()
    expect(report?.reportId).toBeDefined()

    const resolution = "remove-testimony"
    const reason = "important reason"

    const result = await resolveReport({
      reportId,
      resolution,
      reason
    })

    expect(result.data.status).toEqual("success")

    //clean up
    await removeThisTestimony()
    await removeThisReport()
  })
  /**TODO: test of report resolve for allow-testimony */


  it("lets Admins delete the testimony of users", async () => {
    const billId = await createFakeBill()

    await signInUser1()

    const draftId = "test-draft-id"
    const draftRef = doc(firestore, `/users/${authorUid}/draftTestimony/${draftId}`)
    const draft: DraftTestimony = {
      billId,
      content: "test testimony",
      court: currentGeneralCourt,
      position: "endorse",
      attachmentId: null
    }

    await setDoc(draftRef, draft)

    const r = await publishTestimony({ draftId })

    const pubId = r.data.publicationId


    await signInTestAdmin()
    await expectCurrentUserAdmin()

    const pubRef = testDb.collection(`/users/${authorUid}/publishedTestimony`)
    let pubTest = await pubRef.where("id", "==", pubId).get()

    expect(pubTest.size).toEqual(1)

    await deleteTestimony({ uid: authorUid, publicationId: pubId })

    pubTest = await pubRef.where("id", "==", pubId).get()

    expect(pubTest.size).toEqual(0)

  })

  it("keeps archived version of the testimony", async () => {

    await signInUser1()

    const billId = await createFakeBill()
    const draftId = "test-draft-id"
    const draftRef = doc(firestore, `/users/${authorUid}/draftTestimony/${draftId}`)
    const draft: DraftTestimony = {
      billId,
      content: "test testimony",
      court: currentGeneralCourt,
      position: "endorse",
      attachmentId: null
    }

    const archRef = testDb.collection(`/users/${authorUid}/archivedTestimony`)
    const archSize = (await archRef.get()).size

    await setDoc(draftRef, draft)
    const r = await publishTestimony({ draftId })
    const pubId = r.data.publicationId


    await signInTestAdmin()

    await deleteTestimony({ uid: authorUid, publicationId: pubId })

    const archTest = (await archRef.get())


    expect(archTest.size).toEqual(archSize + 1)


  })
})



const modifyAccount = httpsCallable<{ uid: string; role: Role }, void>(
  functions,
  "modifyAccount"
)

describe("admins can modify user accounts", () => {

  it("allows admins to modify user roles ", async () => {
    const userInfo = genUserInfo()
    const user = await testAuth.createUser(userInfo)
    testDb.doc(`profiles/${user.uid}`).set({ role: "user" }, { merge: true })

    await signInTestAdmin()
    await modifyAccount({ uid: user.uid, role: "admin" })

    expect(((await testAuth.getUser(user.uid)).customClaims?.role)).toEqual("admin")

  })

  it("doesn't allow non-admins to modify user roles", async () => {
    const userInfo = genUserInfo()
    const user = await testAuth.createUser(userInfo)
    testDb.doc(`profiles/${user.uid}`).set({ role: "user" }, { merge: true })

    // tries to run modifyAccount as a regular "user" role
    await signInUser(userInfo.email)
    await expectPermissionDenied(modifyAccount({ uid: user.uid, role: "legislator" }))

  })
})
