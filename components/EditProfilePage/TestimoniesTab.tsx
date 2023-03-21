import {
  collection,
  deleteDoc,
  doc,
  query,
  where,
  getDocs
} from "firebase/firestore"
import { Dispatch, SetStateAction, useEffect, useState } from "react"
import styled from "styled-components"
import { useAuth } from "../auth"
import { Alert, Col, Row, Spinner, Stack } from "../bootstrap"
import { useBill, usePublicProfile } from "../db"
import { firestore } from "../firebase"
import { formatBillId } from "../formatting"
import { External, Internal } from "../links"
import { TitledSectionCard } from "../shared"
import { OrgIconSmall } from "./StyledEditProfileComponents"
import UnfollowModal from "./UnfollowModal"

type Props = {
  className?: string
}

export type UnfollowModalConfig = {
  court: number
  orgName: string
  type: string
  typeId: string
}

export function TestimoniesTab({ className }: Props) {
  const { user } = useAuth()
  const uid = user?.uid
  const subscriptionRef = collection(
    firestore,
    `/users/${uid}/activeTopicSubscriptions/`
  )
  const [unfollow, setUnfollow] = useState<UnfollowModalConfig | null>(null)
  const close = () => setUnfollow(null)

  let billList: string[] = []
  const [billsFollowing, setBillsFollowing] = useState<string[]>([])
  let orgsList: string[] = []
  const [orgsFollowing, setOrgsFollowing] = useState<string[]>([])

  const billsFollowingQuery = async () => {
    const q = query(
      subscriptionRef,
      where("uid", "==", `${uid}`),
      where("type", "==", "bill")
    )
    const querySnapshot = await getDocs(q)
    querySnapshot.forEach(doc => {
      // doc.data() is never undefined for query doc snapshots
      billList.push(doc.data().billLookup)
    })

    if (billsFollowing.length === 0 && billList.length != 0) {
      setBillsFollowing(billList)
    }
  }

  useEffect(() => {
    uid ? billsFollowingQuery() : null
  })

  const orgsFollowingQuery = async () => {
    const q = query(
      subscriptionRef,
      where("uid", "==", `${uid}`),
      where("type", "==", "org")
    )
    const querySnapshot = await getDocs(q)
    querySnapshot.forEach(doc => {
      // doc.data() is never undefined for query doc snapshots
      orgsList.push(doc.data().orgId)
    })

    if (orgsFollowing.length === 0 && orgsList.length != 0) {
      setOrgsFollowing(orgsList)
    }
  }

  useEffect(() => {
    uid ? orgsFollowingQuery() : null
  })

  const handleUnfollowClick = async (unfollow: UnfollowModalConfig | null) => {
    if (unfollow !== null) {
      let topicName = ""
      if (unfollow.type == "bill") {
        topicName = `bill-${unfollow.court.toString()}-${unfollow.typeId}`
      } else {
        topicName = `org-${unfollow.typeId}`
      }

      await deleteDoc(doc(subscriptionRef, topicName))

      setBillsFollowing([])
      setOrgsFollowing([])
      setUnfollow(null)
    }
  }

  return (
    <>
      <TitledSectionCard className={className}>
        <h2>Testimonies</h2>
        <div className={`mx-4 mt-3 d-flex flex-column gap-3`}></div>
      </TitledSectionCard>
      <TitledSectionCard className={className}>
        <h2>Draft Testimonies</h2>
        <div className={`mx-4 mt-3 d-flex flex-column gap-3`}></div>
      </TitledSectionCard>
    </>
  )
}
