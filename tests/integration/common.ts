import { fail } from "assert"
import { Role, finishSignup } from "components/auth"
import { Report } from "components/moderation/types"
import { UserRecord } from "firebase-admin/auth"
import { FirebaseError } from "firebase/app"
import {
  Auth,
  UserCredential,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "firebase/auth"
import { currentGeneralCourt } from "functions/src/shared"
import { Testimony } from "functions/src/testimony/types"
import { nanoid } from "nanoid"
import { auth } from "../../components/firebase"
import { Bill, BillContent } from "../../functions/src/bills/types"
import { testAuth, testDb, testTimestamp } from "../testUtils"
import { Timestamp } from "functions/src/firebase"
import { Timestamp as FirestoreTimestamp } from "@google-cloud/firestore"

export async function signInUser(email: string) {
  const { user } = await signInWithEmailAndPassword(auth, email, "password")
  return user
}

export const signInUser1 = () => signInUser("test@example.com")
export const signInUser2 = () => signInUser("test2@example.com")
export const signInUser3 = () => signInUser("test3@example.com")
export const signInUser4 = () => signInUser("test4@example.com")
export const signInTestAdmin = () => signInUser("testadmin@example.com")

export async function createNewBill(props?: Partial<Bill>) {
  const billId = props?.id ?? nanoid()
  const content: BillContent = {
    Pinslip: null,
    Title: "fake",
    PrimarySponsor: null,
    Cosponsors: []
  }
  const bill: Bill = {
    id: billId,
    court: currentGeneralCourt,
    content,
    cosponsorCount: 0,
    testimonyCount: 0,
    endorseCount: 0,
    neutralCount: 0,
    opposeCount: 0,
    latestTestimonyAt: Timestamp.fromMillis(0),
    nextHearingAt: Timestamp.fromMillis(0),
    fetchedAt: Timestamp.fromMillis(0),
    history: [],
    similar: [],
    ...props
  }

  expect(Bill.validate(bill).success).toBeTruthy()

  testDb
    .doc(`/generalCourts/${currentGeneralCourt}/bills/${billId}`)
    .create({
      ...bill,
      latestTestimonyAt: FirestoreTimestamp.fromMillis(0),
      nextHearingAt: FirestoreTimestamp.fromMillis(0),
      fetchedAt: FirestoreTimestamp.fromMillis(0)
    })
    .catch(err => console.log(err))

  return billId
}

export async function deleteBill(id: string) {
  await testDb.doc(`/generalCourts/${currentGeneralCourt}/bills/${id}`).delete()
}

export async function createNewOrg() {
  const id = nanoid()
  await testDb.doc(`/profiles/${id}`).create({
    id,
    name: "fake",
    shortName: "fake",
    slug: "fake"
  })
  return id
}

export async function deleteOrg(id: string) {
  await testDb.doc(`/profiles/${id}`).delete()
}

export const createFakeBill = () => createNewBill().then(b => b)

export async function expectPermissionDenied(work: Promise<any>) {
  const warn = console.warn
  console.warn = jest.fn()
  const e = await work.then(() => fail("permission-denied")).catch(e => e)

  expect(e.code).toMatch("permission-denied")
  console.warn = warn
}

export async function expectStorageUnauthorized(work: Promise<any>) {
  const warn = console.warn
  console.warn = jest.fn()
  const e = await work
    .then(() => fail("expected promise to reject"))
    .catch(e => e)
  expect(e.code).toBe("storage/unauthorized")
  console.warn = warn
}

export async function expectEmailAlreadyInUse(work: Promise<any>) {
  const warn = console.warn
  console.warn = jest.fn()
  const e = await work
    .then(() => fail("expected promise to reject"))
    .catch(e => e)
  expect(e.code).toBe("auth/email-already-in-use")
  console.warn = warn
}

export async function expectInvalidArgument(work: Promise<any>) {
  const warn = console.warn
  console.warn = jest.fn()
  const e = await work
    .then(() => fail("expected promise to reject"))
    .catch(e => e)
  expect(e.code).toBe("invalid-argument")
  console.warn = warn
}

export async function getBill(id: string): Promise<Bill> {
  const doc = await testDb
    .doc(`/generalCourts/${currentGeneralCourt}/bills/${id}`)
    .get()
  return doc.data() as any
}

export const getProfile = (user: { uid: string }) =>
  testDb
    .doc(`/profiles/${user.uid}`)
    .get()
    .then(d => d.data())

export const getUserData = (user: { uid: string }) =>
  testDb
    .doc(`/users/${user.uid}`)
    .get()
    .then(d => d.data())

export const setNewProfile = (user: {
  uid: string
  fullName: string
  email: string
  password: string
}) => testDb.doc(`/profiles/${user.uid}`).set(user)

/** Adds testimony to user's published collection.
 * Returns functions to get, remove, and check where the testimony is.
 */

export const createNewTestimony = async (uid: string, billId: string) => {
  const tid = nanoid(6)

  const currentUserEmail = auth.currentUser?.email

  await signInTestAdmin()
  const testRef = testDb.doc(`/users/${uid}/publishedTestimony/${tid}`)
  const testimony: Testimony = {
    id: tid,
    authorUid: uid,
    fullName: "none",
    authorDisplayName: "none",
    authorRole: "user",
    billTitle: "An act",
    version: 2,
    billId,
    publishedAt: testTimestamp.now(),
    court: 192,
    position: "oppose",
    content: "testimony content"
  }

  try {
    await testRef.set(testimony)
  } catch (e) {
    if (e instanceof FirebaseError) {
      console.log(e.code)
      console.log(e.message)
    } else {
      console.log(e)
    }
  }

  const getThisTestimony = async (): Promise<Testimony> => {
    let testimony: Testimony = await testRef
      .get()
      .then(d => d.data() as Testimony)
    expect(testimony).toBeDefined()
    return testimony
  }

  type WhereType = "pubTest" | "archTest" | "error"

  const whereIsThisTestimony = async (): Promise<WhereType> => {
    const pubRef = testDb.collection(`/users/${uid}/publishedTestimony`)
    const archRef = testDb.collection(`/users/${uid}/archivedTestimony`)

    const pubTest = await pubRef.where("id", "==", tid).get()
    const archTest = await archRef.where("id", "==", tid).get()
    console.log(pubRef.id, archRef.id, pubTest, archTest)
    const result =
      !pubTest.empty && archTest.empty
        ? "pubTest"
        : !archTest.empty && pubTest.empty
        ? "archTest"
        : "error"

    return result
  }

  const removeThisTestimony = async () => {
    const rtest = await testRef.get()
    await signInTestAdmin()

    if (rtest.exists) {
      await testRef.delete()
      return
    }

    const archRef = testDb.doc(`/users/${uid}/archivedTestimony/${tid}`)
    const archTest = await archRef.get()
    if (archTest.exists) {
      await archRef.delete()
      return
    }
  }

  return { tid, getThisTestimony, whereIsThisTestimony, removeThisTestimony }
}

export const createNewReport = async (uid: string, tid: string) => {
  const reportId = nanoid(6)
  const fullReport: Report = {
    id: reportId,
    reportId,
    reporterUid: auth.currentUser!.uid,
    authorUid: uid,
    testimonyId: tid,
    testimonyVersion: "2",
    reportDate: testTimestamp.now(),
    reason: "reason",
    additionalInformation: "additional info"
  }
  const reportRef = testDb.doc(`/reports/${fullReport.reportId}`)
  await reportRef.set(fullReport)

  return { reportId, reportRef }
}

export const genUserInfo = () => {
  return {
    email: nanoid(8) + `@example.com`,
    password: "password",
    confirmedPassword: "password",
    fullName: `Test` + nanoid(8)
  }
}

export const createUser = async (role: Role = "user"): Promise<UserRecord> => {
  const info = genUserInfo()
  const newUser = await testAuth.createUser(info)
  const userRecord = await testAuth.getUser(newUser.uid)
  expect(userRecord).toBeDefined()
  expect(userRecord.customClaims).toBeUndefined()
  return userRecord
}

export const expectCurrentUser = (user?: { uid: string }) => {
  const currentUser = auth.currentUser

  if (!user) {
    expect(currentUser).toBeNull()
  } else {
    expect(currentUser?.uid).toBe(user?.uid)
  }
}

export const expectCurrentUserAdmin = async () => {
  const currentUser = auth.currentUser

  expect(currentUser).toBeDefined()

  expect((await currentUser?.getIdTokenResult())?.claims.role).toBe("admin")
}

export const testCreatePendingOrgWithEmailAndPassword = async (
  uauth: Auth,
  user: { email: string; password: string }
): Promise<UserCredential> => {
  const userCreds = await createUserWithEmailAndPassword(
    uauth,
    user.email,
    user.password
  )

  expectCurrentUser(userCreds.user)

  await finishSignup({ requestedRole: "organization" })

  expect(
    (await testAuth.getUser(userCreds.user.uid)).customClaims
  ).toMatchObject({ role: "pendingUpgrade" })

  const role = "pendingUpgrade"

  await testDb.doc(`profiles/${userCreds.user.uid}`).set(
    {
      role
    },
    { merge: true }
  )

  expect(await getProfile({ uid: userCreds.user.uid })).toHaveProperty(
    "role",
    "pendingUpgrade"
  )

  return userCreds
}

export const deleteUser = async (user: { uid: string }) => {
  await testAuth.deleteUser(user.uid)
}

export const expectUser = async (
  user: UserRecord,
  role: Role | undefined,
  isPublic: boolean | undefined
) => {
  const updated = await testAuth.getUser(user.uid)

  expect(updated.customClaims?.role).toEqual(role)
}

export const createReqObj = async (method: string, url: string) => {
  const authenticationToken = await auth.currentUser?.getIdToken(true)

  return {
    method,
    url,
    headers: { authorization: `Bearer ${authenticationToken}` }
  }
}
