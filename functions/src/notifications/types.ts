import { Frequency } from "../../../common/auth/types"
import { BillHistory } from "../../../common/bills/types"
import { Timestamp } from "../../../common/types"

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
  userRole: string
  testimonyId: string
  testimonyUser: string
  testimonyPosition: string
  testimonyContent: string
  testimonyVersion: number
}

export interface TestimonySubmissionNotificationFields {
  uid: string
  notification: {
    bodyText: string
    header: string
    court: string
    billId: string
    subheader: string
    timestamp: FirebaseFirestore.Timestamp
    type: string
    position: string
    isBillMatch: boolean
    isUserMatch: boolean
    delivered: boolean
    testimonyId: string
    userRole: string
    authorUid: string
  }
  createdAt: FirebaseFirestore.Timestamp
}

export interface BillHistoryUpdateNotificationFields {
  uid: string
  notification: {
    bodyText: string
    header: string
    court: string
    billId: string
    subheader: string
    timestamp: FirebaseFirestore.Timestamp
    type: string
    isBillMatch: boolean
    isUserMatch: boolean
    delivered: boolean
  }
  createdAt: FirebaseFirestore.Timestamp
}

export interface Profile {
  notificationFrequency?: Frequency
  nextDigestAt?: FirebaseFirestore.Timestamp
}
