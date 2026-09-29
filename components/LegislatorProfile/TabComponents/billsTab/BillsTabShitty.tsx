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
      const billsRef = collection(
        firestore,
        `generalCourts/${member.content.GeneralCourtNumber}/bills`
      )

      const q = query(
        billsRef,
        or(
          where("content.PrimarySponsor.Id", "==", member.content.MemberCode),
          where(
            "content.CosponsorIds",
            "array-contains",
            member.content.MemberCode
          )
        )
      )

      const querySnapshot = await getDocs(q)

      const billsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Bill[]

      setBills(billsList)
    } catch (err) {
      setError(true)
    } finally {
      setIsLoading(false)
    }
  }

  void getBills()
}, [member?.content?.GeneralCourtNumber, member?.content?.MemberCode])
