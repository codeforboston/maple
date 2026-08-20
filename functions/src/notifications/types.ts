import { Frequency } from "../auth/types"
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
  userRole: string
  testimonyId: string
  testimonyUser: string
  testimonyPosition: string
  testimonyContent: string
  testimonyVersion: number
  ballotQuestionId?: string | null
  ballotQuestionCourt?: number | null
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
    isBallotQuestionMatch: boolean
    delivered: boolean
    testimonyId: string
    userRole: string
    authorUid: string
    ballotQuestionId?: string | null
    ballotQuestionCourt?: number | null
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

export type BallotQuestionUpdateNotification = {
  type: "ballotQuestion"
  updateTime: Timestamp
  ballotQuestionId: string
  ballotQuestionCourt: number
  ballotStatus: string
  description: string | null
}

export interface BallotQuestionUpdateNotificationFields {
  uid: string
  notification: {
    type: "ballotQuestion"
    ballotQuestionId: string
    ballotQuestionCourt: number
    ballotStatus: string
    header: string | null
    timestamp: FirebaseFirestore.Timestamp
    isBallotQuestionMatch: boolean
    delivered: boolean
  }
  createdAt: FirebaseFirestore.Timestamp
}

export interface Profile {
  email?: string
  notificationFrequency?: Frequency
  nextDigestAt?: FirebaseFirestore.Timestamp
  contactInfo?: {
    publicEmail?: string
  }
}
