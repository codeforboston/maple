import { collection, deleteDoc, doc, getDoc, setDoc } from "firebase/firestore"
import { Bill } from "../db"
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

export const unfollowTopic = async (
  uid: string | undefined,
  topicName: string
) => await deleteDoc(getTopicRef(uid, topicName))
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

export const followsTopic = async (
  uid: string | undefined,
  topicName: string
) => !!uid && (await getDoc(getTopicRef(uid, topicName))).exists()
