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

export async function createFakeBill() {
  const billId = nanoid()
  const content: BillContent = {
    Pinslip: null,
    Title: "fake",
    PrimarySponsor: null,
    Cosponsors: []
  }
  const bill = {
    content,
    court: 192,
    cosponsorCount: 0,
    fetchedAt: testTimestamp.now(),
    id: billId,
    testimonyCount: 0
  }
  await testDb.doc(`/generalCourts/192/bills/${billId}`).create(bill)
  return billId
}

export async function expectPermissionDenied(work: Promise<any>) {
  const warn = console.warn
  console.warn = jest.fn()
  const e = await work
    .then(() => fail("expected promise to reject"))
    .catch(e => e)
  expect(e.code).toBe("permission-denied")
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

export async function getBill(id: string): Promise<Bill> {
  const doc = await testDb.doc(`/generalCourts/192/bills/${id}`).get()
  return doc.data() as any
}

export const getProfile = (user: { uid: string }) =>
  testDb
    .doc(`/profiles/${user.uid}`)
    .get()
    .then(d => d.data())
