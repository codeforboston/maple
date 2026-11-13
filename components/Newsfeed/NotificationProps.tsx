import { Timestamp } from "firebase/firestore"

/** The testimony a cosign cosigns, as it read when the cosign was published. */
export type CosignOf = {
  id: string
  authorUid: string
  authorName: string
  content: string
}

export type NotificationProps = {
  authorUid: string // Testimony author
  billId: string
  bodyText: string
  court: string
  createdAt: Timestamp
  delivered: boolean
  header: string // Bill Title or BQ description
  id: number
  isBillMatch: boolean // Is subscribed to Bill
  isUserMatch: boolean // is subscribed to User/Org
  isBallotQuestionMatch?: boolean
  position: string
  subheader: string
  testimonyId: string
  timestamp: Timestamp
  topicName: string
  type: string
  userRole: string
  // Ballot question fields
  ballotQuestionId?: string
  ballotQuestionCourt?: number
  ballotStatus?: string
  // Set on testimony to a committee of conference
  conferenceId?: string | null
  conferenceName?: string | null
  isConferenceMatch?: boolean // is subscribed to the conference
  cosignOf?: CosignOf | null // set when the testimony cosigns another
}

export type Notifications = NotificationProps[]
