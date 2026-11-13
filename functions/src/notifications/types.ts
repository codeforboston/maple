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

/** The testimony a cosign cosigns, as it read when the cosign was published,
 * so the newsfeed can quote it. */
export type CosignOf = {
  id: string
  authorUid: string
  authorName: string
  content: string
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
  conferenceId?: string | null
  /** The conference's name for headings, set with conferenceId. */
  conferenceName?: string | null
  /** Set on a cosign whose cosigned testimony still exists. */
  cosignOf?: CosignOf | null
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
    /** The reader follows the conference the testimony was filed on. */
    isConferenceMatch?: boolean
    delivered: boolean
    testimonyId: string
    userRole: string
    authorUid: string
    ballotQuestionId?: string | null
    ballotQuestionCourt?: number | null
    conferenceId?: string | null
    conferenceName?: string | null
    cosignOf?: CosignOf | null
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
