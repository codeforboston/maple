import { Timestamp } from "firebase/firestore"

export type NotificationProps = {
  bodyText: string
  court: string
  delivered: boolean
  header: string
  id: number
  subheader: string
  type: string
  topicName: string
  timestamp: Timestamp
  createdAt: Timestamp
}

export type Notifications = NotificationProps[]
