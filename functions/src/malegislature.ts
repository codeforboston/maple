import axiosModule, { AxiosRequestConfig } from "axios"
import {
  HearingContent,
  HearingListItem,
  SessionContent,
  SpecialEventContent
} from "./events/types"

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

/** The timezone used for datetime strings returned by the API. */
export const timeZone = "America/New_York"

export async function listDocuments({
  court
}: {
  court: number
}): Promise<DocumentListing[]> {
  const response = await request({
    url: `/GeneralCourts/${court}/Documents`,
    method: "GET",
    timeout: 60_000
  })
  return response as DocumentListing[]
}

export async function getDocument({
  id,
  court
}: {
  id: string
  court: number
}): Promise<any> {
  const response = await request({
    url: `/GeneralCourts/${court}/Documents/${id}`,
    method: "GET",
    timeout: 30_000
  })
  return response as any
}

export async function listMembers({
  court
}: {
  court: number
}): Promise<MemberListing[]> {
  const response = await request({
    url: `/GeneralCourts/${court}/LegislativeMembers`,
    method: "GET",
    timeout: 60_000
  })
  return response as MemberListing[]
}

export async function getMember({ id, court }: { id: string; court: number }) {
  const response = await request({
    url: `/GeneralCourts/${court}/LegislativeMembers/${id}`,
    method: "GET",
    timeout: 30_000
  })
  const { SponsoredBills, CoSponsoredBills, ...member } = response as any
  return member
}

export async function getSpecialEvents(): Promise<SpecialEventContent[]> {
  const data = await request({
    url: `/SpecialEvents`,
    method: "GET",
    timeout: 60_000
  })
  return data as any
}

export async function getSessions(court: number): Promise<SessionContent[]> {
  const data = await request({
    url: `/GeneralCourts/${court}/Sessions`,
    method: "GET",
    timeout: 60_000
  })
  return data as any
}

export async function listHearings(): Promise<HearingListItem[]> {
  const data = await request({
    url: `/Hearings`,
    method: "GET",
    timeout: 60_000
  })
  return data as any
}

export async function getHearing(eventId: number): Promise<HearingContent> {
  const data = await request({
    url: `/Hearings/${eventId}`,
    method: "GET",
    timeout: 60_000
  })
  return data as any
}

async function request(config: AxiosRequestConfig): Promise<unknown> {
  const response = await axios(config)
  return response.data
}
