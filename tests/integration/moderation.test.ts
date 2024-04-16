import { waitFor } from "@testing-library/react"
import { Role } from "components/auth"
import { resolveReport } from "components/db"
import { doc, setDoc } from "firebase/firestore"
import { httpsCallable } from "firebase/functions"
import {
  syncBillToSearchIndex,
  syncTestimonyToSearchIndex
} from "functions/src"
import { currentGeneralCourt } from "functions/src/shared"
import { nanoid } from "nanoid"
import {
  createNewBill,
  createNewReport,
  createUser,
  signInTestAdmin,
  signInUser,
  signInUser1
} from "tests/integration/common"
import { terminateFirebase, testAuth, testDb } from "tests/testUtils"
import { firestore, functions } from "../../components/firebase"
import { expectPermissionDenied, genUserInfo } from "./common"
import { FirebaseError } from "@firebase/util"
import { Testimony } from "functions/src/testimony/types"
import { Timestamp } from "functions/src/firebase"
import { Report } from "components/moderation/types"
import { fakeUser } from "components/moderation/setUp/MockRecords"

const deleteTestimony = httpsCallable<
  { uid: string; publicationId: string },
  { deleted: boolean }
>(functions, "deleteTestimony")

const publishTestimony = httpsCallable<
  { draftId: string },
  { publicationId: string }
>(functions, "publishTestimony")

let adminUid: string
let billId: string

beforeAll(async () => {
  billId = await createNewBill()
  adminUid = (await signInTestAdmin()).uid
})

let authorUid: string
let email: string

beforeEach(async () => {
  const author = await createUser("user")
  await signInUser(author.email!)
  authorUid = author.uid
  email = author.email!
})

afterAll(terminateFirebase)

describe("moderate testimony", () => {
  it("resolves report for remove-testimony", async () => {
    await signInUser(email)
    const { draft, draftId } = createValidatedDraft(authorUid, billId)
    const draftRef = doc(
      firestore,
      `/users/${authorUid}/draftTestimony/${draftId}`
    )

    await setDoc(draftRef, draft)

    const pubId = (await publishTestimony({ draftId })).data.publicationId

    await signInTestAdmin()

    const { reportId, reportRef } = await createNewReport(adminUid, pubId)

    let report = (await reportRef.get()).data() as Report
    expect(report).toBeDefined()
    expect(report?.reason).toBeDefined()
    expect(report?.reportId).toBeDefined()

    const pubRef = testDb.doc(`/users/${authorUid}/publishedTestimony/${pubId}`)

    expect((await pubRef.get()).exists).toBeTruthy()

    const result = await resolveReport({
      reportId,
      resolution: "remove-testimony",
      reason: "important reason"
    })

    expect(result.data.status).toEqual("success")

    report = (await reportRef.get()).data() as Report
    expect(report.resolution?.resolution).toEqual("remove-testimony")

    await reportRef.delete()
    const testDraftRef = testDb.doc(
      `/users/${authorUid}/draftTestimony/${draftId}`
    )
    await testDraftRef.delete()
    await pubRef.delete()
  })
  /**TODO: test of report resolve for allow-testimony */

  it("lets Admins delete the testimony of users", async () => {
    await signInUser(email)

    const { draftId, draft } = createValidatedDraft(authorUid, billId)
    const draftRef = doc(
      firestore,
      `/users/${authorUid}/draftTestimony/${draftId}`
    )

    await setDoc(draftRef, draft)

    const pubId = (await publishTestimony({ draftId })).data.publicationId

    await signInTestAdmin()
    const pubRef = testDb.collection(`/users/${authorUid}/publishedTestimony`)
    let pubTest = await pubRef.where("id", "==", pubId).get()

    expect(pubTest.size).toEqual(1)

    await deleteTestimony({ uid: authorUid, publicationId: pubId })

    pubTest = await pubRef.where("id", "==", pubId).get()

    expect(pubTest.size).toEqual(0)
  })

  it("keeps archived version of the testimony", async () => {
    await signInUser(email)

    const { draft, draftId } = createValidatedDraft(authorUid, billId)

    const draftRef = doc(
      firestore,
      `/users/${authorUid}/draftTestimony/${draftId}`
    )

    const archRef = testDb
      .collection(`/users/${authorUid}/archivedTestimony`)
      .where("billId", "==", billId)

    const archSize = (await archRef.get()).size

    await setDoc(draftRef, draft)
    const r = await publishTestimony({ draftId })
    const pubId = r.data.publicationId

    await signInTestAdmin()

    await deleteTestimony({ uid: authorUid, publicationId: pubId })

    expect((await archRef.get()).size).toEqual(archSize + 1)
    await waitFor(
      async () =>
        await testDb
          .doc(`/users/${authorUid}/publishedTestimony/${pubId}`)
          .delete()
    )
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

    expect((await testAuth.getUser(user.uid)).customClaims?.role).toEqual(
      "admin"
    )
  })

  it("doesn't allow non-admins to modify user roles", async () => {
    const userInfo = genUserInfo()
    const user = await testAuth.createUser(userInfo)
    testDb.doc(`profiles/${user.uid}`).set({ role: "user" }, { merge: true })

    // tries to run modifyAccount as a regular "user" role
    await signInUser(userInfo.email)
    await expectPermissionDenied(
      modifyAccount({ uid: user.uid, role: "legislator" })
    )
  })
})

function createValidatedDraft(authorUid: string, billId: string) {
  const draftId = nanoid()

  const draft: Testimony = {
    attachmentId: null,
    authorDisplayName: "Anonymous",
    authorUid,
    billId,
    content: "test testimony",
    court: currentGeneralCourt,
    editReason: "edit reason",
    position: "endorse",
    publishedAt: Timestamp.fromMillis(0),
    version: 0,
    id: "unknown",
    authorRole: "user",
    billTitle: "",
    fullName: "Anonymous"
  }

  const validation = Testimony.validateWithDefaults(draft)

  expect(validation.success).toBeTruthy()

  const { publishedAt, ...rest } = draft

  return { draftId, draft: rest }
}
