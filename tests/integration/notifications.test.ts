import { httpsCallable } from "firebase/functions"
import { nanoid } from "nanoid"
import {
  createNewBill,
  createNewTestimony,
  createUser,
  deleteUser,
  getBill,
  signInTestAdmin,
  signInUser
} from "tests/integration/common"
import { terminateFirebase, testDb } from "tests/testUtils"
import { functions } from "../../components/firebase"
import { UserRecord } from "firebase-admin/auth"
import { setFollow, setUnfollow } from "components/shared/FollowingQueries"
import { FieldValue, Timestamp } from "functions/src/firebase"

let billId: string

type Request = { uid: string; fullName: string; email: string }

export const createFakeOrg = httpsCallable<Request, void>(
  functions,
  "createFakeOrg"
)

let authorUid: string
let email: string
let author: UserRecord
let orgId: string

jest.setTimeout(10000)

beforeAll(async () => {
  billId = await createNewBill()
  author = await createUser("user")
  await signInUser(author.email!)
  authorUid = author.uid
  email = author.email!
  orgId = nanoid(8)
  const fullName = "fakeOrg"
  const orgEmail = `${orgId}@example.com`
  await signInTestAdmin()
  await createFakeOrg({ uid: orgId, fullName, email: orgEmail })
})

afterAll(async () => {
  // Clean up notificationEvents collection
  const notificationEventsSnapshot = await testDb
    .collection("/notificationEvents")
    .get()

  const deletePromises = notificationEventsSnapshot.docs.map(doc =>
    doc.ref.delete()
  )
  await Promise.all(deletePromises)

  // Clean up userNotificationFeed collection
  const notificationsSnapshot = await testDb
    .collection(`/users/${authorUid}/userNotificationFeed`)
    .get()

  const deleteNotificationPromises = notificationsSnapshot.docs.map(doc =>
    doc.ref.delete()
  )
  await Promise.all(deleteNotificationPromises)
  await deleteUser(authorUid)
  await deleteUser(orgId)
  await terminateFirebase()
})

describe("Following/Unfollowing user/bill", () => {
  it("Follow/Unfollow an Organization", async () => {
    const topicName = `testimony-${orgId}`

    await signInUser(author.email!)

    // Follow
    await setFollow(
      authorUid,
      topicName,
      undefined,
      undefined,
      undefined,
      orgId
    )

    let subscriptions = await testDb
      .collection(`/users/${authorUid}/activeTopicSubscriptions`)
      .where("userLookup.profileId", "==", orgId)
      .get()

    expect(subscriptions.size).toBe(1)
    let subscription = subscriptions.docs[0].data()
    expect(subscription.topicName).toBe(`testimony-${orgId}`)
    expect(subscription.uid).toBe(authorUid)
    expect(subscription.type).toBe("testimony")
    expect(subscription.userLookup).toEqual({
      profileId: orgId
    })

    //Unfollow
    await setUnfollow(authorUid, topicName)

    subscriptions = await testDb
      .collection(`/users/${authorUid}/activeTopicSubscriptions`)
      .where("userLookup.profileId", "==", orgId)
      .get()

    expect(subscriptions.size).toBe(0)
  })
  it("Follow a User", async () => {
    const testUser = await createUser("user")
    const testUserId = testUser.uid
    const topicName = `testimony-${testUser.uid}`

    await setFollow(
      authorUid,
      topicName,
      undefined,
      undefined,
      undefined,
      testUser.uid
    )

    let subscriptions = await testDb
      .collection(`/users/${authorUid}/activeTopicSubscriptions`)
      .where("userLookup.profileId", "==", testUserId)
      .get()

    expect(subscriptions.size).toBe(1)
    const subscription = subscriptions.docs[0].data()
    expect(subscription.topicName).toBe(`testimony-${testUserId}`)
    expect(subscription.uid).toBe(authorUid)
    expect(subscription.type).toBe("testimony")
    expect(subscription.userLookup).toEqual({
      profileId: testUserId
    })

    //Unfollow
    await setUnfollow(authorUid, topicName)

    subscriptions = await testDb
      .collection(`/users/${authorUid}/activeTopicSubscriptions`)
      .where("userLookup.profileId", "==", testUser.uid)
      .get()

    expect(subscriptions.size).toBe(0)
  })
  it("Follow/Unfollow a Bill", async () => {
    const bill = await getBill(billId)
    const topicName = `bill-${bill.court.toString()}-${billId}`
    const { court: courtId } = bill
    await setFollow(
      authorUid,
      topicName,
      bill as any,
      billId,
      courtId,
      undefined
    )

    let subscriptions = await testDb
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
      court: bill.court
    })

    //Unfollow
    await setUnfollow(authorUid, topicName)

    subscriptions = await testDb
      .collection(`/users/${authorUid}/activeTopicSubscriptions`)
      .where("billLookup.billId", "==", billId)
      .get()
    expect(subscriptions.size).toBe(0)
  })
})

describe("Receiving notifications", () => {
  it("Receiving TestimonySubmissionNotification from Organization", async () => {
    const topicName = `testimony-${orgId}`
    await signInUser(author.email!)

    // Follow
    await setFollow(
      authorUid,
      topicName,
      undefined,
      undefined,
      undefined,
      orgId
    )

    const initialNotificationCount = (
      await testDb
        .collection("/notificationEvents")
        .where("type", "==", "testimony")
        .get()
    ).size

    const { tid } = await createNewTestimony(orgId, billId)

    // Use onSnapshot to listen for changes in notificationEvents
    const notificationEventsPromise = new Promise((resolve, reject) => {
      const unsubscribe = testDb
        .collection("/notificationEvents")
        .where("type", "==", "testimony")
        .onSnapshot(snapshot => {
          if (snapshot.size === initialNotificationCount + 1) {
            unsubscribe()
            resolve(snapshot)
          }
        }, reject)
    })

    const notificationEvents =
      (await notificationEventsPromise) as FirebaseFirestore.QuerySnapshot
    expect(notificationEvents.size).toBe(initialNotificationCount + 1)

    // Use onSnapshot to listen for changes in userNotificationFeed
    const notificationsPromise = new Promise((resolve, reject) => {
      const unsubscribe = testDb
        .collection(`/users/${authorUid}/userNotificationFeed`)
        .where("notification.testimonyId", "==", tid)
        .onSnapshot(snapshot => {
          if (snapshot.size === 1) {
            unsubscribe()
            resolve(snapshot)
          }
        }, reject)
    })

    const notifications =
      (await notificationsPromise) as FirebaseFirestore.QuerySnapshot
    expect(notifications.size).toBe(1)
    const notification = notifications.docs[0].data().notification
    expect(notification.isUserMatch).toBe(true)
  })

  it("Receiving TestimonySubmissionNotification from User", async () => {
    const testUser = await createUser("user")
    const testUserId = testUser.uid
    const topicName = `testimony-${testUserId}`
    await signInUser(author.email!)

    await setFollow(
      authorUid,
      topicName,
      undefined,
      undefined,
      undefined,
      testUserId
    )

    const initialNotificationCount = (
      await testDb
        .collection("/notificationEvents")
        .where("type", "==", "testimony")
        .get()
    ).size

    const { tid } = await createNewTestimony(testUserId, billId)

    // Use onSnapshot to listen for changes in notificationEvents
    const notificationEventsPromise = new Promise((resolve, reject) => {
      const unsubscribe = testDb
        .collection("/notificationEvents")
        .where("type", "==", "testimony")
        .onSnapshot(snapshot => {
          if (snapshot.size === initialNotificationCount + 1) {
            unsubscribe()
            resolve(snapshot)
          }
        }, reject)
    })

    const notificationEvents =
      (await notificationEventsPromise) as FirebaseFirestore.QuerySnapshot
    expect(notificationEvents.size).toBe(initialNotificationCount + 1)

    // Use onSnapshot to listen for changes in userNotificationFeed
    const notificationsPromise = new Promise((resolve, reject) => {
      const unsubscribe = testDb
        .collection(`/users/${authorUid}/userNotificationFeed`)
        .where("notification.testimonyId", "==", tid)
        .onSnapshot(snapshot => {
          if (snapshot.size === 1) {
            unsubscribe()
            resolve(snapshot)
          }
        }, reject)
    })

    const notifications =
      (await notificationsPromise) as FirebaseFirestore.QuerySnapshot
    expect(notifications.size).toBe(1)
    const notification = notifications.docs[0].data().notification
    expect(notification.isUserMatch).toBe(true)
  })
  it("Receiving TestimonySubmissionNotification from Bill", async () => {
    const testUser = await createUser("user")
    const testUserId = testUser.uid
    const bill = await getBill(billId)
    const topicName = `bill-${bill.court.toString()}-${billId}`
    const { court: courtId } = bill
    await signInUser(author.email!)
    await setFollow(
      authorUid,
      topicName,
      bill as any,
      billId,
      courtId,
      undefined
    )

    const initialNotificationCount = (
      await testDb
        .collection("/notificationEvents")
        .where("type", "==", "testimony")
        .get()
    ).size
    const { tid } = await createNewTestimony(testUserId, billId, courtId)

    // Use onSnapshot to listen for changes in notificationEvents
    const notificationEventsPromise = new Promise((resolve, reject) => {
      const unsubscribe = testDb
        .collection("/notificationEvents")
        .where("type", "==", "testimony")
        .onSnapshot(snapshot => {
          if (snapshot.size === initialNotificationCount + 1) {
            unsubscribe()
            resolve(snapshot)
          }
        }, reject)
    })

    const notificationEvents =
      (await notificationEventsPromise) as FirebaseFirestore.QuerySnapshot
    expect(notificationEvents.size).toBe(initialNotificationCount + 1)

    // Use onSnapshot to listen for changes in userNotificationFeed
    const notificationsPromise = new Promise((resolve, reject) => {
      const unsubscribe = testDb
        .collection(`/users/${authorUid}/userNotificationFeed`)
        .where("notification.testimonyId", "==", tid)
        .onSnapshot(snapshot => {
          if (snapshot.size === 1) {
            unsubscribe()
            resolve(snapshot)
          }
        }, reject)
    })

    const notifications =
      (await notificationsPromise) as FirebaseFirestore.QuerySnapshot
    expect(notifications.size).toBe(1)
    const notification = notifications.docs[0].data().notification
    expect(notification.isBillMatch).toBe(true)
  })

  it("Receiving BillHistoryUpdateNotificationEvent", async () => {
    const bill = await getBill(billId)
    const topicName = `bill-${bill.court.toString()}-${billId}`
    const { court: courtId } = bill
    await signInUser(author.email!)
    await setFollow(
      authorUid,
      topicName,
      bill as any,
      billId,
      courtId,
      undefined
    )

    const history1 = {
      Date: Timestamp.now().toDate().toISOString(),
      Branch: Math.random() < 0.5 ? "Senate" : "House",
      Action: (Math.random() + 1).toString(36).substring(2)
    }

    await testDb.doc(`/generalCourts/${courtId}/bills/${billId}`).update({
      history: [history1]
    })

    const notificationEventsPromise = new Promise((resolve, reject) => {
      const unsubscribe = testDb
        .collection("/notificationEvents")
        .where("billId", "==", billId)
        .where("billHistory", "array-contains", history1)
        .onSnapshot(snapshot => {
          if (snapshot.size === 1) {
            expect(snapshot.docs[0].data().billHistory[0]).toEqual(history1)
            unsubscribe()
            resolve(snapshot)
          }
        }, reject)
    })

    const notificationsEvents =
      (await notificationEventsPromise) as FirebaseFirestore.QuerySnapshot
    expect(notificationsEvents.size).toBe(1)

    const initialNotificationCount = (
      await testDb
        .collection(`/users/${authorUid}/userNotificationFeed`)
        .where("notification.type", "==", "bill")
        .get()
    ).size

    // Use onSnapshot to listen for changes in userNotificationFeed
    const notificationsPromise = new Promise((resolve, reject) => {
      const unsubscribe = testDb
        .collection(`/users/${authorUid}/userNotificationFeed`)
        .where("notification.type", "==", "bill")
        .onSnapshot(snapshot => {
          if (snapshot.size === initialNotificationCount + 1) {
            unsubscribe()
            resolve(snapshot)
          }
        }, reject)
    })

    const notifications =
      (await notificationsPromise) as FirebaseFirestore.QuerySnapshot
    expect(notifications.size).toBe(1)
    const notification = notifications.docs[0].data().notification
    expect(notification.isBillMatch).toBe(true)
  })

  it("Receiving TestimonySubmissionNotification from Bill and User", async () => {
    const testUser = await createUser("user")
    const testUserId = testUser.uid
    const bill = await getBill(billId)
    const { court: courtId } = bill
    await signInUser(author.email!)

    await setFollow(
      authorUid,
      `bill-${bill.court.toString()}-${billId}`,
      bill as any,
      billId,
      courtId,
      undefined
    )
    await setFollow(
      authorUid,
      `testimony-${testUserId}`,
      undefined,
      undefined,
      undefined,
      testUserId
    )

    const initialNotificationCount = (
      await testDb
        .collection("/notificationEvents")
        .where("type", "==", "testimony")
        .get()
    ).size

    const { tid } = await createNewTestimony(testUserId, billId, courtId)

    // Use onSnapshot to listen for changes in notificationEvents
    const notificationEventsPromise = new Promise((resolve, reject) => {
      const unsubscribe = testDb
        .collection("/notificationEvents")
        .where("type", "==", "testimony")
        .onSnapshot(snapshot => {
          if (snapshot.size === initialNotificationCount + 1) {
            unsubscribe()
            resolve(snapshot)
          }
        }, reject)
    })

    const notificationEvents =
      (await notificationEventsPromise) as FirebaseFirestore.QuerySnapshot
    expect(notificationEvents.size).toBe(initialNotificationCount + 1)

    // Use onSnapshot to listen for changes in userNotificationFeed
    const notificationsPromise = new Promise((resolve, reject) => {
      const unsubscribe = testDb
        .collection(`/users/${authorUid}/userNotificationFeed`)
        .where("notification.testimonyId", "==", tid)
        .onSnapshot(snapshot => {
          if (snapshot.size === 1) {
            unsubscribe()
            resolve(snapshot)
          }
        }, reject)
    })

    const notifications =
      (await notificationsPromise) as FirebaseFirestore.QuerySnapshot
    expect(notifications.size).toBe(1)
    const notification = notifications.docs[0].data().notification
    expect(notification.isUserMatch).toBe(true)
    expect(notification.isBillMatch).toBe(true)
  })
})
