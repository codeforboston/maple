import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  where
} from "firebase/firestore"
import { firestore } from "../firebase"
import { UnfollowModalConfig } from "./UnfollowModal"

export type Results = { [key: string]: string[] }

function setSubscriptionRef(uid: string | undefined) {
  return collection(firestore, `/users/${uid}/activeTopicSubscriptions/`)
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
  const querySnapshot1 = await getDocs(q1)
  querySnapshot1.forEach(doc => {
    // doc.data() is never undefined for query doc snapshots
    doc.data().billLookup ? results.bills.push(doc.data().billLookup) : null
  })

  const q2 = query(
    subscriptionRef,
    where("uid", "==", `${uid}`),
    where("type", "==", `org`)
  )
  const querySnapshot2 = await getDocs(q2)
  querySnapshot2.forEach(doc => {
    // doc.data() is never undefined for query doc snapshots
    doc.data().orgLookup ? results.orgs.push(doc.data().orgLookup) : null
  })

  return results
}

export async function deleteItem({
  uid,
  unfollow
}: {
  uid: string | undefined
  unfollow: UnfollowModalConfig | null
}) {
  const subscriptionRef = setSubscriptionRef(uid)

  if (unfollow !== null) {
    let topicName = ""
    if (unfollow.type == "bill") {
      topicName = `bill-${unfollow.court.toString()}-${unfollow.typeId}`
    } else {
      topicName = `org-${unfollow.typeId}`
    }

    await deleteDoc(doc(subscriptionRef, topicName))
  }
}
