import { collection, query, where, getDocs } from "firebase/firestore"
import { firestore } from "../firebase"

export type Results = { [key: string]: string[] }

export default async function FollowingQuery(uid: string | undefined) {
  let results: Results = {
    bills: [],
    orgs: []
  }

  const subscriptionRef = collection(
    firestore,
    `/users/${uid}/activeTopicSubscriptions/`
  )

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
