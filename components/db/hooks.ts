import { useEffect, useMemo, useState } from "react"
import * as ops from "./operations"
import { BillContent, MemberContent } from "./types"

export function useBills() {
  const [bills, setBills] = useState<BillContent[] | undefined>(undefined)

  useEffect(() => {
    const fetchBills = async () => {
      if (bills === undefined) {
        const fetched = await ops.listBills(10)
        setBills(fetched)
      }
    }
    fetchBills()
  }, [bills])

  return useMemo(
    () => ({
      bills,
      loading: bills === undefined
    }),
    [bills]
  )
}

export function useMember(memberCode: string) {
  const [member, setMember] = useState<MemberContent | undefined>(undefined)

  useEffect(() => {
    const fetchResource = async () => {
      if (member?.MemberCode !== memberCode) {
        const fetched = await ops.getMember(memberCode)
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
