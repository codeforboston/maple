import { collection, query, where, getDocs } from "firebase/firestore"
import { firestore } from "../firebase"
import { Notifications } from "./NotificationProps"

// This function queries the database for all notifications associated with a user and returns them as an array of notification objects.

export default async function notificationQuery(uid: string | undefined) {
  if (!uid) {
    return [];
  }

  const subscriptionRef = collection(
    firestore,
    `/users/${uid}/userNotificationFeed/`
  )

  let notificationMap = new Map();

  const querySnapshot = await getDocs(subscriptionRef)

  if (!querySnapshot.empty) {
    querySnapshot.forEach(doc => {
      const notification = doc.data().notification;
      notificationMap.set(notification.id, notification); // using notification id as key
    })
  }
  
  // Convert Map values back to an array
  return Array.from(notificationMap.values());
}
