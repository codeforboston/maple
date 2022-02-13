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

export type MemberListing = {
  GeneralCourtNumber: number
  MemberCode: string
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
}): Promise<any> {
  return request({
    url: `/GeneralCourts/${court}/Documents/${id}`,
    method: "GET",
    timeout: 30_000
  })
}

export function listMembers({
  court
}: {
  court: number
}): Promise<MemberListing[]> {
  return request({
    url: `/GeneralCourts/${court}/LegislativeMembers`,
    method: "GET",
    timeout: 60_000
  })
}

export async function getMember({ id, court }: { id: string; court: number }) {
  const { SponsoredBills, CoSponsoredBills, ...member } = await request({
    url: `/GeneralCourts/${court}/LegislativeMembers/${id}`,
    method: "GET",
    timeout: 30_000
  })

  return member
}

type JSON = any
async function request(config: AxiosRequestConfig): Promise<JSON> {
  const response = await axios(config)
  return response.data
}

// /** Strip out bill details and leave just a listing */
// function stripBills(bills: any) {
//   return bills.map(({ BillNumber, DocketNumber, GeneralCourtNumber }: any) => ({
//     BillNumber,
//     DocketNumber,
//     GeneralCourtNumber
//   }))
// }
