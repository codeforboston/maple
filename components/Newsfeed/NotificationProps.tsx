import { Timestamp } from "common/types"

export type NotificationProps = {
  authorUid: string // Testimony author
  billId: string
  bodyText: string
  court: string
  createdAt: Timestamp
  delivered: boolean
  header: string // Bill Title
  id: number
  isBillMatch: boolean // Is subscribed to Bill
  isUserMatch: boolean // is subscribed to User/Org
  position: string
  subheader: string
  testimonyId: string
  timestamp: Timestamp
  topicName: string
  type: string
  userRole: string
}

export type Notifications = NotificationProps[]
