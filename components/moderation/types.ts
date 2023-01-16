export type ReportResolution = "removed" | "allowed"
export type ReportStatus = "new" | "in process" | "resolved"

export type Report = {
  id: string
  reportId: string
  reporterUid: string // the user that made the report
  testimonyId: string
  testimonyVersion: string
  reportDate: string
  reason: string
  additionalInformation?: string
  adminId: string // auth
  resolution: ReportResolution
  adminComment?: string
}
