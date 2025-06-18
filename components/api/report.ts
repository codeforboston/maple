import { AxiosResponse } from "axios"
import { useMutation } from "react-query"
import { Report, ReportResponse } from "../server-api/types"
import { mapleClient } from "./maple-client"
import { Testimony } from "common/testimony/types"

export async function reportTestimony(testimony: Testimony, report: Report) {
  return mapleClient.post<ReportResponse>(
    `/api/users/${testimony.authorUid}/testimony/${testimony.id}/report`,
    report
  )
}

export function useReportTestimony() {
  return useMutation<
    AxiosResponse<ReportResponse>,
    unknown,
    { testimony: Testimony; report: Report }
  >(
    "report-testimony",
    ({ testimony, report }) => reportTestimony(testimony, report),
    { onError: error => console.log({ error }) }
  )
}
