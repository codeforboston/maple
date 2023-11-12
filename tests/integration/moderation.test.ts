import { Testimony, resolveReport } from "components/db"
import { auth as adminAuth, db } from "functions/src/firebase"
import {
  createFakeBill,
  createNewReport,
  createNewTestimony,
  createReqObj,
  expectCurrentUser,
  expectCurrentUserAdmin,
  signInTestAdmin,
  signInUser,
  signInUser1
} from "tests/integration/common"
import { auth, functions } from "../../components/firebase"
import e from "express"
import handler from "pages/api/users/[uid]/testimony/[tid]"
import { NextApiRequest, NextApiResponse } from "next"
import { mapleClient } from "components/api/maple-client"
import { Resolution } from "components/moderation"
import { onSubmitReport } from "components/moderation/RemoveTestimony"
import { terminateFirebase } from "tests/testUtils"
import { httpsCallable } from "firebase/functions"

// const authtoken = process.env.AUTH_TOKEN

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

// afterAll(terminateFirebase)

describe.skip("examples of helper functions", () => {
  it("shows it's logged in as admin", async () => {
    try {
      expect((await adminAuth.getUser(adminUid)).customClaims).toEqual({
        role: "admin"
      })
    } catch (e) {
      console.warn(e)
    }

    expect(await adminAuth.getUser(adminUid)).toBeDefined()
    expect((await adminAuth.getUser(adminUid)!).uid).toEqual(adminUid)
  })

  it("creates testimony", async () => {
    const { tid, getThisTestimony, removeThisTestimony } =
      await createNewTestimony(authorUid, "H1002")
    const test1 = await getThisTestimony()
    expect(test1).toBeDefined()
    expect(test1!.id).toEqual(tid)

    // clean up
    await removeThisTestimony()
  })

  it(" creates reports", async () => {
    const { tid, removeThisTestimony } = await createNewTestimony(
      authorUid,
      "H1002"
    )
    const { reportId, getThisReport, removeThisReport } = await createNewReport(
      adminUid,
      tid
    )

    const rep1 = await getThisReport()
    expect(rep1).toBeDefined()
    expect(rep1!.id).toEqual(reportId)
    // clean up
    await removeThisTestimony()
    await removeThisReport()
  })
})

describe.skip("action functions", () => {
  it("can set file report resolution via resolveReport", async () => {
    // set up
    const { tid, getThisTestimony, whereIsThisTestimony, removeThisTestimony } =
      await createNewTestimony(authorUid, "H1002")
    const { reportId, getThisReport, removeThisReport } = await createNewReport(
      adminUid,
      tid
    )

    const report = await getThisReport()
    expect(report).toBeDefined()
    expect(report?.reason).toBeDefined()
    expect(report?.reportId).toBeDefined()

    const resolution = "remove-testimony" /// need to test both allow and remove
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

  it("moves testimony from published to archived", async () => {
    // set up
    const billId = await createFakeBill()
    const t = await createNewTestimony(authorUid, billId)
    const where = await t.whereIsThisTestimony()
    expect(where).toEqual("pubTest")

    // const r = await createNewReport(adminUid, t.tid)

    await signInTestAdmin()
    await expectCurrentUserAdmin()

    const deleted = await deleteTestimony({ uid: authorUid, publicationId: t.tid })

    expect(deleted).toBeTruthy()


    // const refresh = jest.fn()
    // await onSubmitReport(
    //   r.reportId,
    //   "remove-testimony",
    //   "reason",
    //   authorUid,
    //   t.tid,
    //   refresh
    // )

    const where2 = await t.whereIsThisTestimony()
    expect(where2).toEqual("archTest")

    //clean up
    // await t.removeThisTestimony()
    // await r.removeThisReport()
  })

  it("Admins can delete the testimony of another user", async () => {
    // set up
    const { tid, getThisTestimony, whereIsThisTestimony, removeThisTestimony } =
      await createNewTestimony(adminUid, "H1002")

    const { authorUid, id } = (await getThisTestimony()) as Testimony

    expect(authorUid).toBeDefined()
    expect(id).toBeDefined()

    const admin = await adminAuth.getUser(adminUid)
    await signInUser(admin.email!)

    expect(auth.currentUser).toBeDefined()

    // await deleteTestimony(authorUid, id)

    const where = await whereIsThisTestimony()
    // expect(where).toEqual("archTest")
  })
})
