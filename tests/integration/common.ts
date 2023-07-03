import { currentGeneralCourt } from "functions/src/shared"
import { signInWithEmailAndPassword } from "firebase/auth"
import { nanoid } from "nanoid"
import { auth } from "../../components/firebase"
import { Bill, BillContent } from "../../functions/src/bills/types"
import { testDb, testTimestamp } from "../testUtils"

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
    content,
    court: currentGeneralCourt,
    cosponsorCount: 0,
    fetchedAt: testTimestamp.now(),
    id: billId,
    testimonyCount: 0,
    endorseCount: 0,
    neutralCount: 0,
    opposeCount: 0,
    history: [],
    similar: [],
    ...props
  }
  await testDb
    .doc(`/generalCourts/${currentGeneralCourt}/bills/${billId}`)
    .create(bill)
  return billId
}

export async function deleteBill(id: string) {
  await testDb
    .doc(`/generalCourts/${currentGeneralCourt}/bills/${id}`)
    .delete()
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
  const e = await work
    .then(() => fail("expected promise to reject"))
    .catch(e => e)
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

