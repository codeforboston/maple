import {
  collection,
  getDocs,
  query,
  where
} from "firebase/firestore"
import { useEffect, useState } from "react"
import { firestore } from "../../firebase"
import { Testimony } from "./types"

export interface BillTestimonyResult {
  draft?: Testimony;
  published?: Testimony;
  loading: boolean;
}

export const useBillTestimony = (uid: string, billId: string): BillTestimonyResult => {
  const [published, setPublished] = useState<Testimony>()
  const [draft, setDraft] = useState<Testimony>()
  const [loading, setLoading] = useState<boolean>(true)

  const fetchDrafts = async (uid: string, billId: string) => {
    setLoading(true)
    const publishedData = await getPublishedTestimony(uid, billId)
    const draftData = await getDraftTestimony(uid, billId)

    setPublished(publishedData?.docs[0].data() as Testimony)
    setDraft(draftData?.docs[0].data() as Testimony)

    setLoading(false)
  }

  useEffect(() => {
    if (uid && billId) {
      fetchDrafts(uid, billId).catch(err => console.error(err))
    }
  }, [uid, billId])

  return {
    draft,
    published,
    loading
  }
}

const getPublishedTestimony = (uid: string, billId: string) => getDocs(
  query(
    collection(firestore, `users/${uid}/publishedTestimony`),
    where("billId", "==", billId)
  )
)

const getDraftTestimony = (uid: string, billId: string) => getDocs(
  query(
    collection(firestore, `users/${uid}/draftTestimony`),
    where("billId", "==", billId)
  )
)
