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

async function request(config: AxiosRequestConfig) {
  const response = await axios(config)
  return response.data
}
