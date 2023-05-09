import { Role } from "components/auth"
import { functions } from "components/firebase"
import { Timestamp } from "@google-cloud/firestore"
import { httpsCallable } from "firebase/functions"

export type ReportStatus = "new" | "in process" | "resolved"
export type Resolution = "remove-testimony" | "allow-testimony"

export type Report = {
  id: string
  reportId: string
  reporterUid: string // the user that made the report
  authorUid: string
  testimonyId: string
  testimonyVersion: string
  reportDate: Timestamp
  reason: string
  additionalInformation?: string
  resolution?: ReportResolution
}

export type ReportResolution = {
  resolution: Resolution
  reason?: string
  moderatorUid: string
  resolvedAt: Timestamp
  authorUid: string
  archivedTestimonyId: string
}

export const modifyAccount = httpsCallable<{ uid: string; role: Role }, void>(
  functions,
  "modifyAccount"
)
