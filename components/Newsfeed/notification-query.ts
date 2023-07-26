import { collection, query, where, getDocs } from "firebase/firestore"
import { firestore } from "../firebase"
import { Notifications } from "./NotificationProps"

export default async function notificationQuery(uid: string | undefined) {
  const subscriptionRef = collection(
    firestore,
    `/users/${uid}/userNotificationFeed/`
  )
  let notificationList: Notifications = []
  const q = query(subscriptionRef, where("uid", "==", `${uid}`))
  const querySnapshot = await getDocs(q)
  querySnapshot.forEach(doc => {
    // doc.data() is never undefined for query doc snapshots
    notificationList.push(doc.data().notification)
  })
  return notificationList
}
