import React, { useEffect, useState } from "react"
import { MemberContent } from "functions/src/members/types"
import {
  collection,
  query,
  where,
  doc,
  getDoc,
  getFirestore
} from "firebase/firestore"
import { Bill } from "functions/src/bills/types"
import { BillsTabContainer } from "./BillsTabContainer"

export const BillsTab = ({ member }: { member: MemberContent }) => {
  const [allBills, setBills] = useState<Bill[]>([])
  const [loading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<boolean>(false)

  useEffect(() => {
    if (!member?.GeneralCourtNumber || !member?.MemberCode) {
      setBills([])
      return
    }

    const getBills = async () => {
      setIsLoading(true)
      setError(false)

      try {
        const firestore = getFirestore()
        const courtNumber = member.GeneralCourtNumber
        const memberCode = member.MemberCode

        const memberDocRef = doc(
          firestore,
          `generalCourts/${courtNumber}/members/${memberCode}`
        )
        const memberSnapshot = await getDoc(memberDocRef)

        if (!memberSnapshot.exists()) {
          setBills([])
          return
        }

        const memberData = memberSnapshot.data()
        const sponsored = memberData.content.SponsoredBills || []
        const cosponsored = memberData.content.CoSponsoredBills || []

        const allBillIds = Array.from(new Set([...sponsored, ...cosponsored]))

        if (allBillIds.length === 0) {
          setBills([])
          return
        }

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

        setBills(resolvedBills.filter((b): b is Bill => b !== null))
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

  return <BillsTabContainer member={member} bills={allBills} />
}
