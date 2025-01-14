import { httpsCallable } from "firebase/functions"
import { nanoid } from "nanoid"
import {
  createNewBill,
  createUser,
  deleteUser,
  getBill,
  getUserData,
  signInTestAdmin,
  signInUser
} from "tests/integration/common"
import { terminateFirebase, testAuth, testDb } from "tests/testUtils"
import { firestore, functions } from "../../components/firebase"
import { UserRecord } from "firebase-admin/auth"

let billId: string

type Request = { uid: string; fullName: string; email: string }
type Response = { uid: string; tid: string }

const followUser = httpsCallable<{
  userLookup: { profileId: string; fullName: string }
}>(functions, "followUser")

const followBill = httpsCallable<{
  billLookup: { billId: string; court: string }
}>(functions, "followBill")

export const createFakeOrg = httpsCallable<Request, void>(
  functions,
  "createFakeOrg"
)

export const createFakeTestimony = httpsCallable<Request, Response>(
  functions,
  "createFakeTestimony"
)

beforeAll(async () => {
  billId = await createNewBill()
})

let authorUid: string
let email: string
let author: UserRecord

beforeEach(async () => {
  author = await createUser("user")
  await signInUser(author.email!)
  authorUid = author.uid
  email = author.email!
})

afterAll(async () => {
  await deleteUser({ uid: authorUid })
  terminateFirebase
})

describe("Following/Unfollowing user/bill", () => {
  it("Follow/Unfollow an Organization", async () => {
    const orgId = nanoid(8)
    const fullName = "fakeOrg"
    const email = `${orgId}@example.com`

    await signInTestAdmin()
    await createFakeOrg({ uid: orgId, fullName, email })
    await signInUser(author.email!)
    // Follow
    await followUser({ userLookup: { profileId: orgId, fullName: "Test Org" } })

    const subscriptions = await testDb
      .collection(`/users/${authorUid}/activeTopicSubscriptions`)
      .where("userLookup.profileId", "==", orgId)
      .get()

    expect(subscriptions.size).toBe(1)
    const subscription = subscriptions.docs[0].data()
    expect(subscription.topicName).toBe(`testimony-${orgId}`)
    expect(subscription.uid).toBe(authorUid)
    expect(subscription.type).toBe("testimony")
    expect(subscription.userLookup).toEqual({
      profileId: orgId,
      fullName: "Test Org"
    })
    expect(subscription.nextDigestAt).toBeDefined()

    //Unfollow
  })
  it("Follow a User", async () => {
    const testUser = await createUser("user")
    const testUserId = testUser.uid
    const testUserName = (await getUserData(testUser))?.fullName

    await followUser({
      userLookup: { profileId: testUser.uid, fullName: testUserName }
    })

    const subscriptions = await testDb
      .collection(`/users/${authorUid}/activeTopicSubscriptions`)
      .where("userLookup.profileId", "==", testUserId)
      .get()

    expect(subscriptions.size).toBe(1)
    const subscription = subscriptions.docs[0].data()
    expect(subscription.topicName).toBe(`testimony-${testUserId}`)
    expect(subscription.uid).toBe(authorUid)
    expect(subscription.type).toBe("testimony")
    expect(subscription.userLookup).toEqual({
      profileId: testUserId,
      fullName: testUserName
    })
    expect(subscription.nextDigestAt).toBeDefined()
  })
  it("Follow a Bill", async () => {
    const bill = await getBill(billId)
    await followBill({
      billLookup: { billId: billId, court: bill.court.toString() }
    })

    const subscriptions = await testDb
      .collection(`/users/${authorUid}/activeTopicSubscriptions`)
      .where("billLookup.billId", "==", billId)
      .get()

    expect(subscriptions.size).toBe(1)
    const subscription = subscriptions.docs[0].data()
    expect(subscription.topicName).toBe(
      `bill-${bill.court.toString()}-${billId}`
    )
    expect(subscription.type).toBe("bill")
    expect(subscription.billLookup).toEqual({
      billId: billId,
      court: bill.court.toString()
    })
    expect(subscription.nextDigestAt).toBeDefined()
  })
})
