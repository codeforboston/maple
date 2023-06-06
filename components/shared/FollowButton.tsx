import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  setDoc,
  where
} from "firebase/firestore"
import { useAuth } from "../auth"
import { Bill } from "../db"
import { firestore } from "../firebase"
import { useTranslation } from "next-i18next"
import { useState, useEffect } from "react"
import { Col, Button } from "react-bootstrap"
import { StyledImage } from "components/ProfilePage/StyledProfileComponents"

export const FollowButton = ({
  bill,
  profileid
}: {
  bill?: Bill
  profileid?: string
}) => {
  const { t } = useTranslation("common")

  const { user } = useAuth()
  const uid = user?.uid

  const billId = bill?.id
  const courtId = bill?.court
  let topicName = ``
  bill
    ? (topicName = `bill-${courtId}-${billId}`)
    : (topicName = `org-${profileid}`)

  const subscriptionRef = collection(
    firestore,
    `/users/${uid}/activeTopicSubscriptions/`
  )
  const [queryResult, setQueryResult] = useState("")

  const TopicQuery = async () => {
    const q = query(subscriptionRef, where("topicName", "==", topicName))
    const querySnapshot = await getDocs(q)
    querySnapshot.forEach(doc => {
      // doc.data() is never undefined for query doc snapshots
      setQueryResult(doc.data().topicName)
    })
  }

  useEffect(() => {
    uid ? TopicQuery() : null
  })

  const FollowClick = async () => {
    bill
      ? await setDoc(doc(subscriptionRef, topicName), {
          topicName: topicName,
          uid: uid,
          billLookup: {
            billId: billId,
            court: courtId
          },
          type: "bill"
        })
      : await setDoc(doc(subscriptionRef, topicName), {
          topicName: topicName,
          uid: uid,
          orgLookup: {
            profileid: profileid
          },
          type: "org"
        })

    setQueryResult(topicName)
  }

  const UnfollowClick = async () => {
    await deleteDoc(doc(subscriptionRef, topicName))

    setQueryResult("")
  }

  const isFollowing = queryResult
  const text = isFollowing ? t("button.following") : t("button.follow")
  const checkmark = isFollowing ? (
    <StyledImage src="/check-white.svg" alt="checkmark" />
  ) : null
  const clickFunction = () => {
    isFollowing ? UnfollowClick() : FollowClick()
  }

  return (
    <>
      {bill ? (
        <FollowBill
          checkmark={checkmark}
          clickFunction={clickFunction}
          text={text}
          uid={uid}
        />
      ) : (
        <FollowOrg
          checkmark={checkmark}
          clickFunction={clickFunction}
          text={text}
        />
      )}
    </>
  )
}

function FollowOrg({
  checkmark,
  clickFunction,
  text
}: {
  checkmark: JSX.Element | null
  clickFunction: any
  text: string
}) {
  return (
    <Col className={`d-flex w-100 justify-content-start`}>
      <div>
        <div className="view-edit-profile">
          <Button onClick={clickFunction} className={`btn btn-lg py-1`}>
            {text}
            {checkmark}
          </Button>
        </div>
      </div>
    </Col>
  )
}

function FollowBill({
  checkmark,
  clickFunction,
  text,
  uid
}: {
  checkmark: JSX.Element | null
  clickFunction: any
  text: string
  uid?: string
}) {
  return (
    <Button
      className={`btn btn-primary btn-sm ms-auto py-1 w-auto ${
        uid ? "" : "visually-hidden"
      }`}
      onClick={clickFunction}
    >
      {text}
      {checkmark}
    </Button>
  )
}
