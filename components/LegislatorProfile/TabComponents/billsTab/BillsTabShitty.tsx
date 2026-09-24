import { doc, getDoc, getFirestore } from "firebase/firestore"

useEffect(() => {
  if (!member?.content?.GeneralCourtNumber || !member?.content?.MemberCode) {
    setBills([])
    return
  }

  const getBills = async () => {
    setIsLoading(true)
    setError(false)

    try {
      const firestore = getFirestore()
      const courtNumber = member.content.GeneralCourtNumber
      const memberCode = member.content.MemberCode

      // 1. Fetch the member document directly
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
      const sponsored = memberData.SponsoredBills || []
      const cosponsored = memberData.CoSponsoredBills || []

      // Combine arrays and remove duplicate Bill IDs
      const allBillIds = Array.from(new Set([...sponsored, ...cosponsored]))

      if (allBillIds.length === 0) {
        setBills([])
        return
      }

      // 2. Fetch the corresponding bill documents concurrently
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

      // Filter out null values in case a referenced bill doesn't exist
      setBills(resolvedBills.filter((b): b is Bill => b !== null))
    } catch (err) {
      console.error("Error retrieving member's bills:", err)
      setError(true)
    } finally {
      setIsLoading(false)
    }
  }

  void getBills()
}, [member?.content?.GeneralCourtNumber, member?.content?.MemberCode])
