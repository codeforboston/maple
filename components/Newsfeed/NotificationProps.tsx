import { Timestamp } from "firebase/firestore"

export type NotificationProps = BillHistoryNotification | TestimonyNotification

type BillHistoryNotification = {
  type: "bill"
  bodyText: string
  court: string
  delivered: boolean
  header: string // Bill Title
  id: number
  subheader: string
  topicName: string
  timestamp: Timestamp
  createdAt: Timestamp
  isBillMatch: boolean // Is subscribed to Bill
  isUserMatch: boolean // is subscribed to User/Org
}

interface TestimonyNotification {
  type: "testimony"
  bodyText: string
  court: string
  delivered: boolean
  header: string // Bill Title
  id: number
  subheader: string
  topicName: string
  timestamp: Timestamp
  createdAt: Timestamp
  position: string
  isBillMatch: boolean // Is subscribed to Bill
  isUserMatch: boolean // is subscribed to User/Org
  authorUid: string // Testimony author
  testimonyId: string
  userRole: string
}

export type Notifications = NotificationProps[]
