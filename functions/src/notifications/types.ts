import { BillHistory } from "../bills/types"
import { Timestamp } from "../firebase"

export interface Notification {
  type: string
  updateTime: Timestamp
  billCourt: string
  billId: string
  billName: string
}

export type BillHistoryUpdateNotification = Notification & {
  type: "bill"
  billHistory: BillHistory
}

export type TestimonySubmissionNotification = Notification & {
  type: "testimony"
  userId: string
  testimonyUser: string
  testimonyPosition: string
  testimonyContent: string
  testimonyVersion: number
}

export interface NotificationFields {
  uid: string
  notification: {
    bodyText: string
    header: string
    court: string
    id: string
    subheader: string
    timestamp: FirebaseFirestore.Timestamp
    type: string
    position?: string
    isBillMatch: boolean
    isUserMatch: boolean
    delivered: boolean
    authorUid?: string
  }
  createdAt: FirebaseFirestore.Timestamp
}
