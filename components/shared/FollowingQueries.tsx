import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  setDoc,
  where
} from "firebase/firestore"
import { Bill } from "common/bills/types"
import { firestore } from "../firebase"
import { UnfollowModalConfig } from "components/EditProfilePage/UnfollowModal"

export type Results = { [key: string]: string[] }

function setSubscriptionRef(uid: string | undefined) {
  return collection(firestore, `/users/${uid}/activeTopicSubscriptions/`)
}

export async function deleteItem({
  uid,
  unfollowItem
}: {
  uid: string | undefined
  unfollowItem: UnfollowModalConfig | null
}) {
  const subscriptionRef = setSubscriptionRef(uid)

  if (unfollowItem !== null) {
    let topicName = ""
    if (unfollowItem.type == "bill") {
      topicName = `bill-${unfollowItem.court.toString()}-${unfollowItem.typeId}`
    } else {
      topicName = `testimony-${unfollowItem.typeId}`
    }

    await deleteDoc(doc(subscriptionRef, topicName))
  }
}

export async function FollowingQuery(uid: string | undefined) {
  let results: Results = {
    bills: [],
    orgs: []
  }

  const subscriptionRef = setSubscriptionRef(uid)

  const q1 = query(
    subscriptionRef,
    where("uid", "==", `${uid}`),
    where("type", "==", `bill`)
  )
  const querySnapshotBills = await getDocs(q1)
  querySnapshotBills.forEach(doc => {
    // doc.data() is never undefined for query doc snapshots
    doc.data().billLookup ? results.bills.push(doc.data().billLookup) : null
  })

  const q2 = query(
    subscriptionRef,
    where("uid", "==", `${uid}`),
    where("type", "==", `org`)
  )
  const querySnapshotOrgs = await getDocs(q2)
  querySnapshotOrgs.forEach(doc => {
    // doc.data() is never undefined for query doc snapshots
    doc.data().userLookup ? results.orgs.push(doc.data().userLookup) : null
  })

  return results
}

export async function setFollow(
  uid: string | undefined,
  topicName: string,
  bill: Bill | undefined,
  billId: string | undefined,
  courtId: number | undefined,
  profileId: string | undefined
) {
  const subscriptionRef = setSubscriptionRef(uid)

  bill
    ? await setDoc(doc(subscriptionRef, topicName), {
        topicName: topicName,
        uid: uid,
        billLookup: {
          billId: billId,
          court: courtId
        },
        type: "bill"
      })
    : await setDoc(doc(subscriptionRef, topicName), {
        topicName: topicName,
        uid: uid,
        userLookup: {
          profileId: profileId
        },
        type: "testimony"
      })
}

export async function setUnfollow(uid: string | undefined, topicName: string) {
  const subscriptionRef = setSubscriptionRef(uid)

  await deleteDoc(doc(subscriptionRef, topicName))
}

export async function TopicQuery(uid: string | undefined, topicName: string) {
  let result = ""

  const subscriptionRef = setSubscriptionRef(uid)

  const q = query(subscriptionRef, where("topicName", "==", topicName))
  const querySnapshot = await getDocs(q)
  querySnapshot.forEach(doc => {
    // doc.data() is never undefined for query doc snapshots
    result = doc.data().topicName
  })
  return result
}
