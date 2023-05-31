import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  setDoc,
  where
} from "firebase/firestore"
import { firestore } from "../firebase"
import { useState, useEffect } from "react"
import { Col, Button } from "react-bootstrap"
import { StyledImage } from "components/ProfilePage/StyledProfileComponents"
import { useTranslation } from "next-i18next"

export const FollowButton = ({
  elementType,
  profileid,
  uid
}: {
  elementType: string
  profileid: string
  uid?: string
}) => {
  const { t } = useTranslation("profile")

  const topicName = `org-${profileid}`
  const subscriptionRef = collection(
    firestore,
    `/users/${uid}/activeTopicSubscriptions/`
  )
  const [queryResult, setQueryResult] = useState("")

  const orgQuery = async () => {
    const q = query(
      subscriptionRef,
      where("topicName", "==", `org-${profileid}`)
    )
    const querySnapshot = await getDocs(q)
    querySnapshot.forEach(doc => {
      // doc.data() is never undefined for query doc snapshots
      setQueryResult(doc.data().topicName)
    })
  }

  useEffect(() => {
    uid ? orgQuery() : null
  })

  const FollowClick = async () => {
    await setDoc(doc(subscriptionRef, topicName), {
      topicName: topicName,
      uid: uid,
      profileid: profileid,
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
      (elementType == "org") ? (
      <FollowOrg
        checkmark={checkmark}
        clickFunction={clickFunction}
        text={text}
      />
      ) : (<></>)
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
