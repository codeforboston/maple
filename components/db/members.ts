import { Timestamp } from "firebase/firestore"
import { useMemo } from "react"
import { useAsync } from "react-async-hook"
import { currentGeneralCourt, loadDoc } from "./common"

export type CommitteeReference = {
  CommitteeCode: string
  GeneralCourtNumber: number
}

export type MemberContent = {
  Name: string
  GeneralCourtNumber: number
  LeadershipPosition: string | null
  Branch: string
  MemberCode: string
  District: string
  Party: string
  EmailAddress: string
  RoomNumber: string
  PhoneNumber: string
  FaxNumber: string | null
  Committees: CommitteeReference[]
}

export type Member = {
  content: MemberContent
  fetchedAt: Timestamp
  id: string
}

export type MemberSearchIndexItem = Pick<
  MemberContent,
  "District" | "EmailAddress" | "MemberCode" | "Name" | "Party"
>

export type MemberSearchIndex = {
  representatives: (MemberSearchIndexItem & { Branch: "House" })[]
  senators: (MemberSearchIndexItem & { Branch: "Senate" })[]
}

export function useMember(court: number, id?: string) {
  const { loading, result } = useAsync(getMember, [court, id])
  return useMemo(
    () => ({
      member: result,
      loading
    }),
    [loading, result]
  )
}

export function useMemberSearch() {
  const { result: index, loading } = useAsync(getMemberSearchIndex, [])
  return { index, loading }
}

async function getMember(
  court: number,
  memberCode?: string
): Promise<MemberContent | undefined> {
  if (!memberCode) return undefined
  const member = await loadDoc(`/generalCourts/${court}/members/${memberCode}`)
  return member?.content
}

async function getMemberSearchIndex(): Promise<MemberSearchIndex | undefined> {
  return loadDoc(
    `/generalCourts/${currentGeneralCourt}/indexes/memberSearch`
  ) as any
}
