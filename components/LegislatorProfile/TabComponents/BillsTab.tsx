import React, { useEffect, useState } from "react"
import { MemberContent } from "components/db"
import { doc, getDoc, getFirestore } from "firebase/firestore"
import { Bill } from "functions/src/bills/types"
import {
  buildMemberBillSummary,
  MemberBillSummary
} from "functions/src/members/memberBillSummary"
import { BillsTabContainer } from "./BillsTab/BillsTabContainer"

const emptySummary: MemberBillSummary = {
  schemaVersion: 2,
  all: { count: 0, topics: [] },
  sponsored: { count: 0, topics: [] },
  cosponsored: { count: 0, topics: [] },
  recentSponsoredBills: []
}

export const BillsTab = ({ member }: { member: MemberContent }) => {
  const [billSummary, setBillSummary] =
    useState<MemberBillSummary>(emptySummary)
  const [loading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<boolean>(false)

  useEffect(() => {
    if (!member?.GeneralCourtNumber || !member?.MemberCode) {
      setBillSummary(emptySummary)
      return
    }

    const getBillSummary = async () => {
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

        if (
          summarySnapshot.exists() &&
          summarySnapshot.get("schemaVersion") === 2
        ) {
          setBillSummary(summarySnapshot.data() as MemberBillSummary)
          return
        }

        // Keep profiles usable until their summary has been generated.
        const memberSnapshot = await getDoc(
          doc(firestore, `generalCourts/${courtNumber}/members/${memberCode}`)
        )
        if (!memberSnapshot.exists()) {
          setBillSummary(emptySummary)
          return
        }

        const memberData = memberSnapshot.data()
        const sponsoredIds = new Set<string>(
          memberData.content.SponsoredBills || []
        )
        const cosponsoredIds = new Set<string>(
          memberData.content.CoSponsoredBills || []
        )
        const allBillIds = Array.from(
          new Set([...sponsoredIds, ...cosponsoredIds])
        )
        const billPromises = allBillIds.map(async billId => {
          const billDocRef = doc(
            firestore,
            `generalCourts/${courtNumber}/bills/${billId}`
          )
          const billSnap = await getDoc(billDocRef)

          if (billSnap.exists()) {
            return { id: billSnap.id, ...billSnap.data() } as Bill
          }
          return null
        })

        const resolvedBills = await Promise.all(billPromises)
        const all = resolvedBills.filter((bill): bill is Bill => bill !== null)

        setBillSummary(
          buildMemberBillSummary(
            [...sponsoredIds],
            [...cosponsoredIds],
            all.map(bill => ({
              id: bill.id,
              content: { Title: bill.content.Title },
              topics: bill.topics
            }))
          )
        )
      } catch (err) {
        console.error("Error retrieving member's bills:", err)
        setError(true)
      } finally {
        setIsLoading(false)
      }
    }

    void getBillSummary()
  }, [member?.GeneralCourtNumber, member?.MemberCode])

  if (loading) {
    return <div>Loading bills...</div>
  }

  if (error) {
    return <div>Error loading bills.</div>
  }

  return (
    <BillsTabContainer
      member={member}
      summary={billSummary}
      court={member?.GeneralCourtNumber}
    />
  )
}
