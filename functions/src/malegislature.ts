import axiosModule, { AxiosRequestConfig } from "axios"
import { isString } from "lodash"
import { DateTime } from "luxon"
import { Array } from "runtypes"
import { create as createRootCas } from "ssl-root-cas"
import { BillHistory, BillReference } from "./bills/types"
import { CityBills, CityListing } from "./cities/types"
import { CommitteeContent, CommitteeListing } from "./committees/types"
import {
  HearingContent,
  HearingListItem,
  SessionContent,
  SpecialEventContent
} from "./events/types"
import { Timestamp } from "./firebase"
import { MemberContent } from "./members/types"

/**
 * The MA Legislature website's SSL certificate only contains the first
 * certificate in the chain, but its full-chain includes root and intermediate
 * DigiCert certs. Browsers happen to bundle these but tools like curl and node
 * only include root certs. So we need to add the intermediate cert in order to
 * create HTTPS connections. Sigh...
 *
 * https://www.digicert.com/kb/digicert-root-certificates.htm
 */
function addCertificates() {
  const rootCas = createRootCas()
  rootCas.addFile(__dirname + "/ssl/DigiCert TLS RSA SHA256 2020 CA1.pem")
  require("https").globalAgent.options.ca = rootCas
}

function createClient() {
  addCertificates()
  const client = axiosModule.create({
    baseURL: "https://malegislature.gov/api",
    timeout: 5000
  })
  return client
}

export const axios = createClient()

async function request(config: AxiosRequestConfig): Promise<unknown> {
  const response = await axios(config)
  return response.data
}

function justIds(listing: { BillNumber: string | null }[]): string[] {
  return listing.map(b => b.BillNumber).filter(isString)
}

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

export function parseApiDateTime(dateTime: string): Timestamp {
  const time = DateTime.fromISO(dateTime, { zone: timeZone })
  return Timestamp.fromMillis(time.toMillis())
}

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

export async function getDocumentPdf({
  id,
  court
}: {
  id: string
  court: number
}) {
  const response = await request({
    baseURL: "https://malegislature.gov",
    url: `/Bills/${court}/${id}.pdf`,
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
  const data: any = await request({
    url: `/GeneralCourts/${court}/LegislativeMembers/${id}`,
    method: "GET",
    timeout: 30_000
  })
  const member: MemberContent = {
    ...data,
    SponsoredBills: justIds(data.SponsoredBills),
    CoSponsoredBills: justIds(data.CoSponsoredBills),
    // Some members have committees with null codes ??
    Committees: data.Committees.filter((c: any) => !!c.CommitteeCode)
  }
  return MemberContent.check(member)
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

export async function getBillHistory(
  court: number,
  billId: string
): Promise<BillHistory> {
  const data = await request({
    url: `/GeneralCourts/${court}/Documents/${billId}/DocumentHistoryActions`,
    method: "GET",
    timeout: 60_000
  })
  return BillHistory.check(data)
}

export async function listCommittees(court: number): Promise<CommitteeListing> {
  const data = await request({
    url: `/GeneralCourts/${court}/Committees`,
    method: "GET",
    timeout: 60_000
  })

  return CommitteeListing.check(data)
}

export async function getCommittee(
  court: number,
  id: string
): Promise<CommitteeContent> {
  const data: any = await request({
    url: `/GeneralCourts/${court}/Committees/${id}`,
    method: "GET",
    timeout: 60_000
  })
  const content: CommitteeContent = {
    ...data,
    DocumentsBeforeCommittee: justIds(data.DocumentsBeforeCommittee),
    ReportedOutDocuments: justIds(data.ReportedOutDocuments)
  }
  return CommitteeContent.check(content)
}

export async function listCities(court: number) {
  const data = await request({
    url: `/GeneralCourts/${court}/Documents/SupportedCities`,
    method: "GET",
    timeout: 60_000
  })
  return CityListing.check(data)
}

export async function getCityBills(court: number, name: string) {
  const data = await request({
    url: `/GeneralCourts/${court}/Cities/${name}/Documents`,
    method: "GET",
    timeout: 60_000
  })
  return CityBills.check(data)
}

const SimilarBills = Array(BillReference)
export async function getSimilarBills(court: number, id: string) {
  const data = await request({
    url: `GeneralCourts/${court}/Documents/${id}/Similar`,
    method: "GET",
    timeout: 60_000
  })
  return SimilarBills.check(data)
}
