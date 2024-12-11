import { Timestamp } from "firebase/firestore"

export type NotificationProps = {
  bodyText: string
  court: string
  delivered: boolean
  header: string // Bill Title
  id: number
  subheader: string
  type: string
  topicName: string
  timestamp: Timestamp
  createdAt: Timestamp
  position?: string
  isBillMatch: boolean // Is subscribed to Bill
  isUserMatch: boolean // is subscribed to User/Org
  authorUid?: string // Testimony author
  testimonyId?: string
  userRole?: string
}

export type Notifications = NotificationProps[]
