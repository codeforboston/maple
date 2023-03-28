export interface SuccessfulResponse<D> {
  data: D
}
export interface FailedResponse<E> {
  error: E
}

export type MapleResponse<D, E>  = SuccessfulResponse<D> | FailedResponse<E>

// Sent to the server
export interface Report {
  reason: string,
  additionalInfo?: string,
}

// Stored in firestore
export type ReportInDatabase = Report & {
  version: string,
  reporterUid: string
}

export type ReportResponse = MapleResponse<{report: Report, id: string}, {message: string}>;
