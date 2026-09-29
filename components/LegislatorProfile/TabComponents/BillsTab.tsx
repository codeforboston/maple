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
import { BillsTabContainer } from "./BillsTab/BillsTabContainer"

type BillGroups = {
  all: Bill[]
  sponsored: Bill[]
  cosponsored: Bill[]
}

export const BillsTab = ({ member }: { member: MemberContent }) => {
  const [billGroups, setBillGroups] = useState<BillGroups>({
    all: [],
    sponsored: [],
    cosponsored: []
  })
  const [loading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<boolean>(false)

  useEffect(() => {
    if (!member?.GeneralCourtNumber || !member?.MemberCode) {
      setBillGroups({ all: [], sponsored: [], cosponsored: [] })
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
          setBillGroups({ all: [], sponsored: [], cosponsored: [] })
          return
        }

        const memberData = memberSnapshot.data()
        const sponsored = memberData.content.SponsoredBills || []
        const cosponsored = memberData.content.CoSponsoredBills || []
        const sponsoredIds = new Set<string>(sponsored)
        const cosponsoredIds = new Set<string>(cosponsored)

        const allBillIds = Array.from(
          new Set([...sponsoredIds, ...cosponsoredIds])
        )

        if (allBillIds.length === 0) {
          setBillGroups({ all: [], sponsored: [], cosponsored: [] })
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
        const all = resolvedBills.filter((bill): bill is Bill => bill !== null)

        setBillGroups({
          all,
          sponsored: all.filter(bill => sponsoredIds.has(bill.id)),
          cosponsored: all.filter(bill => cosponsoredIds.has(bill.id))
        })
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

  return <BillsTabContainer member={member} bills={billGroups} />
}
