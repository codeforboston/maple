import { collection, getDocs, query, where } from "firebase/firestore"
import { firestore } from "../../components/firebase"
import {
  followBallotQuestion,
  unfollowBallotQuestion
} from "../../components/shared/FollowingQueries"
import { terminateFirebase, testDb } from "../testUtils"
import { expectPermissionDenied, signInUser1, signInUser2 } from "./common"

afterAll(terminateFirebase)

describe("ballot question following", () => {
  const ballotQuestionId = "question-1"
  const court = 193
  const topicName = `ballot-question-${court}-${ballotQuestionId}`
  const bq = { id: ballotQuestionId, court }

  it("followBallotQuestion writes a subscription doc with correct shape", async () => {
    const user1 = await signInUser1()
    const uid = user1.uid

    await followBallotQuestion(uid, bq)

    const snap = await testDb
      .doc(`/users/${uid}/activeTopicSubscriptions/${topicName}`)
      .get()

    expect(snap.exists).toBe(true)
    expect(snap.data()).toEqual({
      topicName,
      uid,
      type: "ballotQuestion",
      ballotQuestionLookup: { ballotQuestionId, court }
    })
  })

  it("unfollowBallotQuestion deletes the subscription doc", async () => {
    const user1 = await signInUser1()
    const uid = user1.uid

    await followBallotQuestion(uid, bq)
    await unfollowBallotQuestion(uid, bq)

    const snap = await testDb
      .doc(`/users/${uid}/activeTopicSubscriptions/${topicName}`)
      .get()

    expect(snap.exists).toBe(false)
  })

  it("querying by uid and type ballotQuestion returns correct lookup", async () => {
    const user1 = await signInUser1()
    const uid = user1.uid

    await followBallotQuestion(uid, bq)

    const q = query(
      collection(firestore, `/users/${uid}/activeTopicSubscriptions/`),
      where("uid", "==", uid),
      where("type", "==", "ballotQuestion")
    )
    const snapshot = await getDocs(q)
    const results: { ballotQuestionId: string; court: number }[] = []
    snapshot.forEach(doc => {
      if (doc.data().ballotQuestionLookup)
        results.push(doc.data().ballotQuestionLookup)
    })

    expect(results).toHaveLength(1)
    expect(results[0]).toEqual({ ballotQuestionId, court })
  })

  it("a user cannot write to another user's subscriptions", async () => {
    const user1 = await signInUser1()
    await signInUser2()

    await expectPermissionDenied(followBallotQuestion(user1.uid, bq))
  })
})
