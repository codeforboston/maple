import React, { useEffect, useState } from "react"
import type { MemberContent } from "functions/src/members/types"
import { doc, getDoc, getFirestore } from "firebase/firestore"
import type { MemberBillSummary } from "functions/src/members/memberBillSummary"
import { BillsTabContainer } from "./BillsTab/BillsTabContainer"

const emptyBillSummary: MemberBillSummary = {
  all: { count: 0, topics: [] },
  sponsored: { count: 0, topics: [] },
  cosponsored: { count: 0, topics: [] },
  recentSponsoredBills: []
}

export const BillsTab = ({ member }: { member: MemberContent }) => {
  const [billSummary, setBillSummary] =
    useState<MemberBillSummary>(emptyBillSummary)
  const [loading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<boolean>(false)

  useEffect(() => {
    if (!member?.GeneralCourtNumber || !member?.MemberCode) {
      setBillSummary(emptyBillSummary)
      return
    }

    const getBills = async () => {
      setIsLoading(true)
      setError(false)

      try {
        const firestore = getFirestore()
        const courtNumber = member.GeneralCourtNumber
        const memberCode = member.MemberCode
        const summaryDocRef = doc(
          firestore,
          `generalCourts/${courtNumber}/memberBillSummaries/${memberCode}`
        )
        const summarySnapshot = await getDoc(summaryDocRef)
        setBillSummary(
          summarySnapshot.exists()
            ? (summarySnapshot.data() as MemberBillSummary)
            : emptyBillSummary
        )
      } catch (err) {
        console.error("Error retrieving member's bills:", err)
        setError(true)
      } finally {
        setIsLoading(false)
      }
    }

    void getBills()
  }, [member?.GeneralCourtNumber, member?.MemberCode])

  if (loading) {
    return <div>Loading bills...</div>
  }

  if (error) {
    return <div>Error loading bills.</div>
  }

  return <BillsTabContainer member={member} bills={billSummary} />
}
