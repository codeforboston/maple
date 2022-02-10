import axiosModule, { AxiosRequestConfig } from "axios"

const axios = axiosModule.create({
  baseURL: "https://malegislature.gov/api",
  timeout: 5000
})

export type DocumentListing = {
  BillNumber: string | null
  DocketNumber: string
  GeneralCourtNumber: number
}

export type Legislator = {
  Id: string
  Name: string
  Type: number
}

export type Document = {
  Title: string
  BillNumber: string | null
  DocketNumber: string
  GeneralCourtNumber: number
  PrimarySponsor: Legislator
  Cosponsors: Legislator[]
  LegislationTypeName: string
  Pinslip: string
  DocumentText: string
}

/** The general court is the name for a session of the legislature, which lasts
 * two years. */
export const currentGeneralCourt = 192

export function listDocuments({
  court
}: {
  court: number
}): Promise<DocumentListing[]> {
  return request({
    url: `/GeneralCourts/${court}/Documents`,
    method: "GET",
    timeout: 60_000
  })
}

export function getDocument({
  id,
  court
}: {
  id: string
  court: number
}): Promise<Document> {
  return request({
    url: `/GeneralCourts/${court}/Documents/${id}`,
    method: "GET",
    timeout: 30_000
  })
}

async function request(config: AxiosRequestConfig) {
  const response = await axios(config)
  return response.data
}
