import { useState, useEffect, useMemo, useCallback } from "react"
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
  fetchedAt: Date
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

export function useMember(memberCode: string) {
  const [member, setMember] = useState<MemberContent | undefined>(undefined)

  useEffect(() => {
    const fetchResource = async () => {
      if (member?.MemberCode !== memberCode) {
        const fetched = await getMember(memberCode)
        setMember(fetched)
      }
    }
    fetchResource()
  }, [member, memberCode])

  return useMemo(
    () => ({
      member,
      loading: member === undefined
    }),
    [member]
  )
}

export function useMemberSearch() {
  const { resource: index, loading } = useResource(
    useCallback(() => getMemberSearchIndex(), [])
  )
  return { index, loading }
}

function useResource<T>(getResource: () => Promise<T>) {
  const [resource, setResource] = useState<T | undefined>(undefined)

  useEffect(() => {
    const fetchResource = async () => {
      if (resource === undefined) {
        const fetched = await getResource()
        setResource(fetched)
      }
    }
    fetchResource()
  }, [resource, getResource])

  return useMemo(
    () => ({
      resource,
      loading: resource === undefined
    }),
    [resource]
  )
}

async function getMember(
  memberCode: string
): Promise<MemberContent | undefined> {
  const member = await loadDoc(
    `/generalCourts/${currentGeneralCourt}/members/${memberCode}`
  )
  return member?.content
}

async function getMemberSearchIndex(): Promise<MemberSearchIndex | undefined> {
  return loadDoc(
    `/generalCourts/${currentGeneralCourt}/indexes/memberSearch`
  ) as any
}
