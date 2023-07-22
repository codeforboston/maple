import { Timestamp } from "firebase/firestore"


export type NotificationProps = {
  bodyText: string
  court: string
  delivered: boolean
  header: string
  id: number
  subheader: string
  timestamp: Timestamp
  type: string
  topicName: string
  createdAt: Timestamp
}

export type Notifications = NotificationProps[]
