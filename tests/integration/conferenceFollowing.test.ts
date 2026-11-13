import { waitFor } from "@testing-library/react"
import { currentGeneralCourt } from "functions/src/shared"
import { doc, setDoc } from "firebase/firestore"
import { httpsCallable } from "firebase/functions"
import { nanoid } from "nanoid"
import { firestore, functions } from "../../components/firebase"
import {
  followConference,
  unfollowConference
} from "../../components/shared/FollowingQueries"
import { terminateFirebase, testDb } from "../testUtils"
import {
  createConference,
  createFakeBill,
  deleteBill,
  expectPermissionDenied,
  signInUser1,
  signInUser2
} from "./common"

afterAll(terminateFirebase)

const court = currentGeneralCourt
const publishTestimony = httpsCallable<
  { draftId: string },
  { publicationId: string }
>(functions, "publishTestimonyV2")

const subscription = (uid: string, topicName: string) =>
  testDb.doc(`/users/${uid}/activeTopicSubscriptions/${topicName}`)

const feedFor = (uid: string, testimonyId: string) =>
  testDb
    .collection(`/users/${uid}/userNotificationFeed`)
    .where("notification.testimonyId", "==", testimonyId)
    .get()

describe("following a conference", () => {
  let billId: string
  let conferenceId: string
  let topicName: string

  beforeEach(async () => {
    billId = await createFakeBill()
    conferenceId = await createConference(billId, {
      title: "An Act relative to quiet libraries",
      name: "Quiet Libraries"
    })
    topicName = `conference-${court}-${conferenceId}`
  })

  afterEach(async () => {
    await Promise.all([
      testDb
        .doc(`/generalCourts/${court}/conferences/${conferenceId}`)
        .delete(),
      deleteBill(billId)
    ])
  })

  it("writes a conference subscription, and unfollowing deletes it", async () => {
    const { uid } = await signInUser1()
    const conference = { id: conferenceId, court }

    await followConference(uid, conference)
    expect((await subscription(uid, topicName).get()).data()).toEqual({
      topicName,
      uid,
      type: "conference",
      conferenceLookup: { conferenceId, court }
    })

    await unfollowConference(uid, conference)
    expect((await subscription(uid, topicName).get()).exists).toBe(false)
  })

  it("won't let a user follow for someone else", async () => {
    const user1 = await signInUser1()
    await signInUser2()

    await expectPermissionDenied(
      followConference(user1.uid, { id: conferenceId, court })
    )
  })

  it("sends new input on the conference to its followers, and only them", async () => {
    const follower = await signInUser2()
    await followConference(follower.uid, { id: conferenceId, court })

    const author = await signInUser1()
    const draftId = nanoid()
    await setDoc(
      doc(firestore, `/users/${author.uid}/draftTestimony/${draftId}`),
      {
        billId,
        court,
        content: "Keep the libraries quiet.",
        position: "passSenateVersion",
        attachmentId: null,
        ballotQuestionId: null,
        conferenceId
      }
    )
    const {
      data: { publicationId }
    } = await publishTestimony({ draftId })

    await waitFor(
      async () => {
        const feed = await feedFor(follower.uid, publicationId)
        expect(feed.size).toBe(1)
        expect(feed.docs[0].data().notification).toMatchObject({
          type: "testimony",
          conferenceId,
          conferenceName: "Quiet Libraries",
          isConferenceMatch: true,
          isBillMatch: false,
          isUserMatch: false,
          position: "passSenateVersion"
        })
      },
      { timeout: 20000, interval: 500 }
    )
    // The author hears nothing of their own input.
    expect((await feedFor(author.uid, publicationId)).size).toBe(0)

    await subscription(follower.uid, topicName).delete()
  }, 30000)
})
