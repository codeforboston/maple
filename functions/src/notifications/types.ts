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
  orgId: string
  testimonyUser: string
  testimonyPosition: string
  testimonyContent: string
  testimonyVersion: number
}
