import { DocumentData, DocumentReference } from "@google-cloud/firestore"
import { signInTestAdmin } from "tests/integration/common"
import { auth, functions } from "../../components/firebase"
import {
  createFakeTestimonyReport,
  fakeUser
} from "../../components/moderation/setUp/MockRecords"
import { Report, Resolution } from "../../components/moderation/types"
import { testAuth, testDb } from "../testUtils"
// import { resolveReport } from "components/db"
import { onSubmitReport } from "components/moderation/RemoveTestimony"
import { httpsCallable } from "firebase/functions"
import { Testimony } from "components/db"

const deleteTestimonyHttps = httpsCallable<
  { uid: string; publicationId: string },
  { deleted: boolean }
>(functions, "deleteTestimony")

jest.setTimeout(30000)
// afterAll(terminateFirebase)

const authtoken = process.env.AUTH_TOKEN

let testimonyRef: DocumentReference<DocumentData>
let reportRef: DocumentReference<DocumentData>
let adminUid: string
let userId: string

beforeAll(async () => {
  const adminUser = await testAuth.createUser(fakeUser())
  const role = "admin"
  await expect(
    testAuth.setCustomUserClaims(adminUser.uid, { role: role })
  ).resolves.toBeUndefined()

  const updatedUser = await testAuth.getUser(adminUser.uid)
  adminUid = updatedUser.uid

  const { user, testimony, report } = createFakeTestimonyReport()

  userId = user.uid

  expect(userId).toEqual(testimony.authorUid)

  const userRef = testDb.doc(`/users/${userId}`)
  userRef.set({ id: userId })

  testimonyRef = testDb.doc(
    `/users/${userId}/publishedTestimony/${testimony.id}`
  )

  reportRef = testDb.doc(`reports/${report.id}`)

  await testDb.doc(testimonyRef.path).set(testimony)
  await testDb.doc(reportRef.path).set(report)
})

describe("reporting testimony flow", () => {
  it("testimony and report exist", async () => {
    const testimonyResult = await testimonyRef.get()
    expect(testimonyResult.exists).toBeTruthy()

    const reportResult = await testimonyRef.get()
    expect(reportResult.exists).toBeTruthy()
  })

  it("can get testimony from userId", async () => {
    const testUserPublishedTestimonyRef = testDb.collection(
      `/users/${userId}/publishedTestimony`
    )
    expect((await testUserPublishedTestimonyRef.get()).empty).toBeFalsy()
    expect((await testUserPublishedTestimonyRef.get()).docs).toBeDefined()
    ;(await testUserPublishedTestimonyRef.get()).docs.forEach(t => {
      const td = t.data() as Testimony
      expect(td.content).toBeDefined()
    })
  })

  it("can get report", async () => {
    const result = await reportRef.get()
    expect(result.exists).toBeTruthy()
    expect((result.data() as Report).reason).toBeDefined()
  })
})

describe("action functions", () => {
  it("set file report resolution via resolveReport", async () => {
    // await expect(signInTestAdmin()).resolves.toBeDefined()

    const result = await reportRef.get()
    expect(result.exists).toBeTruthy()

    expect((result.data() as Report).reason).toBeDefined()
    expect((result.data() as Report).reportId).toBeDefined()

    const reportId = result.data()?.id
    const resolution = "remove-testimony" /// need to test both allow and remove
    const reason = "important reason"

    // expect(
    //   (await resolveReport({
    //     reportId,
    //     resolution,
    //     reason
    //   })).data.status
    // ).toEqual("success" )
  })

  it.skip("move testimony from published to archived via deleteTestimony https", async () => {
    // set up
    // const { user, testimony, report } = createFakeTestimonyReport()
    // const localReportRef = testDb.doc(`reports/${report.id}`)
    // const localTestimonyRef = testDb.doc(
    //   `users/${user.uid}/publishedTestimony/${testimony.id}`
    // )
    // await localTestimonyRef.set(testimony)
    // await localReportRef.set(report)
    const refresh = jest.fn()
    await expect(signInTestAdmin()).resolves.toBeDefined()

    const admin = testAuth.getUser(adminUid)
    expect(admin).toBeDefined()

    expect((await testimonyRef.get()).exists).toBeTruthy()
    expect((await reportRef.get()).exists).toBeTruthy()

    const reportGet = await reportRef.get()

    expect(reportGet.exists).toBeTruthy()

    const report = reportGet.data() as Report

    const { reportId, authorUid, testimonyId } = report

    const resolution: Resolution = "remove-testimony"

    expect(authorUid).toBeDefined()
    expect(testimonyId).toBeDefined()

    console.log(report)

    await onSubmitReport(
      reportId,
      resolution,
      "reason",
      authorUid,
      testimonyId,
      refresh
    )
      .then(d => console.log(d))
      .catch(c => console.log(c))

    const archiveRef = testDb.doc(
      `users/${authorUid}/archivedTestimony/${testimonyId}`
    )

    expect((await testimonyRef.get()).exists).toBeFalsy()
    expect((await archiveRef.get()).exists).toBeTruthy()

    //clean up
  })

  it.skip("Admins can delete the testimony of another user", async () => {
    const testimony = await testimonyRef.get()
    expect(testimony.exists).toBeTruthy()
    const data = testimony.data() as Testimony
    const { authorUid, id } = data
    expect(authorUid).toBeDefined()
    expect(id).toBeDefined()
    expect(await testAuth.getUser(adminUid)).toBeDefined()
    expect(auth.currentUser).toBeDefined()

    await expect(signInTestAdmin()).resolves.toBeDefined()

    // const result = await deleteTestimony({
    //   uid: testimony.data()!.authorUid,
    //   publicationId: id
    // })

    // expect(result.data.deleted).toBeTruthy()
    // await expect(testimonyRef.get().then(d => d.exists)).resolves.toBeFalsy()
  })
})
