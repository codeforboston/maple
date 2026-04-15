import { collection, deleteDoc, doc, getDoc, setDoc } from "firebase/firestore"
import { BallotQuestion, Bill } from "../db"
import { firestore } from "../firebase"

function getTopicRef(uid: string | undefined, topicName: string) {
  return doc(
    collection(firestore, `/users/${uid}/activeTopicSubscriptions/`),
    topicName
  )
}

export const billTopicName = (court: number, billId: string) =>
  `bill-${court}-${billId}`
export const profileTopicName = (profileId: string) => `testimony-${profileId}`
export const ballotQuestionTopicName = (court: number, id: string) =>
  `ballot-question-${court}-${id}`

export const followBill = async (uid: string | undefined, bill: Bill) => {
  const topicName = billTopicName(bill.court, bill.id)
  await setDoc(getTopicRef(uid, topicName), {
    topicName,
    uid,
    billLookup: {
      billId: bill.id,
      court: bill.court
    },
    type: "bill"
  })
}

const unfollowTopic = async (uid: string | undefined, topicName: string) =>
  await deleteDoc(getTopicRef(uid, topicName))

export const unfollowBill = async (
  uid: string | undefined,
  bill: Pick<Bill, "id" | "court">
) => await unfollowTopic(uid, billTopicName(bill.court, bill.id))

export const followProfile = async (
  uid: string | undefined,
  profileId: string
) => {
  const topicName = profileTopicName(profileId)
  await setDoc(getTopicRef(uid, topicName), {
    topicName,
    uid,
    userLookup: { profileId },
    type: "testimony"
  })
}

export const unfollowProfile = async (
  uid: string | undefined,
  profileId: string
) => await unfollowTopic(uid, profileTopicName(profileId))

export const followBallotQuestion = async (
  uid: string | undefined,
  ballotQuestion: Pick<BallotQuestion, "id" | "court">
) => {
  const topicName = ballotQuestionTopicName(
    ballotQuestion.court,
    ballotQuestion.id
  )
  await setDoc(getTopicRef(uid, topicName), {
    topicName,
    uid,
    ballotQuestionLookup: {
      ballotQuestionId: ballotQuestion.id,
      court: ballotQuestion.court
    },
    type: "ballotQuestion"
  })
}

export const unfollowBallotQuestion = async (
  uid: string | undefined,
  ballotQuestion: Pick<BallotQuestion, "id" | "court">
) =>
  await unfollowTopic(
    uid,
    ballotQuestionTopicName(ballotQuestion.court, ballotQuestion.id)
  )

export const followsTopic = async (
  uid: string | undefined,
  topicName: string
) => !!uid && (await getDoc(getTopicRef(uid, topicName))).exists()
