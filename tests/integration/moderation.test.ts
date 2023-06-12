import { deleteTestimony } from "components/api/delete-testimony"
import { Testimony, resolveReport } from "components/db"
import { auth as adminAuth, db } from "functions/src/firebase"
import {
  createNewReport,
  createNewTestimony,
  createReqObj,
  signInTestAdmin,
  signInUser
} from "tests/integration/common"
import { auth } from "../../components/firebase"
import e from "express"
import handler from "pages/api/users/[uid]/testimony/[tid]"
import { NextApiRequest, NextApiResponse } from "next"
import { mapleClient } from "components/api/maple-client"
// import supertest from "supertest"
// afterAll(terminateFirebase)

// const authtoken = process.env.AUTH_TOKEN

let adminUid: string
let uid: string

// const MockGoogleAuth = jest.mock("../../node_modules/google-auth-library")

beforeAll(async () => {
  const user = await signInTestAdmin()
  uid = user.uid
  adminUid = user.uid

  await db.doc(`/profiles/${uid}`).update({ role: "admin" })
  expect((await db.doc(`/profiles/${uid}`).get()).data()?.role).toEqual("admin")

  expect(auth.currentUser).toBeDefined()
})

describe("this", () => {
  it("testing the set up", async () => {})
})

describe("examples of helper functions", () => {
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
    const { tid, getThisTestimony, whereIsThisTestimony, removeThisTestimony } =
      await createNewTestimony(uid, "H1002")
    const test1 = await getThisTestimony()
    expect(test1).toBeDefined()
    expect(test1!.id).toEqual(tid)

    // clean up
    await removeThisTestimony()
  })

  it(" creates reports", async () => {
    const { tid, getThisTestimony, removeThisTestimony } =
      await createNewTestimony(uid, "H1002")
    const { reportId, getThisReport, removeThisReport } = await createNewReport(
      uid,
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

describe("action functions", () => {
  it("set file report resolution via resolveReport", async () => {
    // set up
    const { tid, getThisTestimony, whereIsThisTestimony, removeThisTestimony } =
      await createNewTestimony(uid, "H1002")
    const { reportId, getThisReport, removeThisReport } = await createNewReport(
      uid,
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

  it("moves testimony from published to archived via deleteTestimony endpoint", async () => {
    // set up
    const { tid, getThisTestimony, whereIsThisTestimony, removeThisTestimony } =
      await createNewTestimony(uid, "H1002")
    const { reportId, getThisReport, removeThisReport } = await createNewReport(
      uid,
      tid
    )
    const refresh = jest.fn()
    await signInTestAdmin()

    const [report, testimony] = await Promise.allSettled([
      getThisReport(),
      getThisTestimony()
    ])

    report.status === "fulfilled"
      ? expect(report.value).toBeDefined()
      : report.status === "rejected"
      ? console.warn(report.reason)
      : console.warn("something went wrong")

    testimony.status === "fulfilled"
      ? expect(testimony.value).toBeDefined()
      : testimony.status === "rejected"
      ? console.warn(testimony.reason)
      : console.warn("something went wrong")

    const res = await mapleClient.delete(`/api/users/${uid}/testimony/${tid}`)

    console.log(res)

    // const res = await deleteTestimony(uid, tid)

    // const resolution: Resolution = "remove-testimony"

    // await onSubmitReport(
    //   reportId,
    //   resolution,
    //   "reason",
    //   authorUid,
    //   testimonyId,
    //   refresh
    // )

    const where = await whereIsThisTestimony()
    expect(where).toEqual("archTest")

    //clean up
    await removeThisTestimony()
    await removeThisReport()
  })

  it("Admins can delete the testimony of another user", async () => {
    // set up
    const { tid, getThisTestimony, whereIsThisTestimony, removeThisTestimony } =
      await createNewTestimony(uid, "H1002")

    const { authorUid, id } = (await getThisTestimony()) as Testimony

    expect(authorUid).toBeDefined()
    expect(id).toBeDefined()

    const admin = await adminAuth.getUser(adminUid)
    await signInUser(admin.email!)

    expect(auth.currentUser).toBeDefined()

    await deleteTestimony(authorUid, id)

    const where = await whereIsThisTestimony()
    // expect(where).toEqual("archTest")
  })
})
