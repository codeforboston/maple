import { signInWithEmailAndPassword } from "firebase/auth"
import { nanoid } from "nanoid"
import { BillContent } from "../../components/db"
import { auth } from "../../components/firebase"
import { testTimestamp, testDb } from "../testUtils"

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
  const bill = {
    content: "fake" as any as BillContent,
    cosponsorCount: 0,
    fetchedAt: testTimestamp.now(),
    id: billId,
    testimonyCount: 0
  }
  await testDb.doc(`/generalCourts/192/bills/${billId}`).create(bill)
  return billId
}
