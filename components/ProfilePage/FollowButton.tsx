import { firestore } from "../firebase"
import { collection, getDocs, query, where } from "firebase/firestore"
import { Col, Button } from "react-bootstrap"
import { Internal } from "components/links"
import { StyledImage } from "./StyledProfileComponents"
import { useTranslation } from "next-i18next"
import { getFunctions, httpsCallable } from "firebase/functions"
import { useState, useEffect, useCallback } from "react"
import { FillButton } from "components/buttons"
import { User } from "firebase/auth"
import { Maybe } from "components/db/common"

export const FollowButton = ({
  profileId,
  user
}: {
  profileId?: string
  user: Maybe<User>
}) => {
  const { t } = useTranslation("profile")
  const functions = getFunctions()
  const followBillFunction = httpsCallable(functions, "followOrg")
  const unfollowBillFunction = httpsCallable(functions, "unfollowOrg")

  const topicName = `org-${profileId}`
  const subscriptionRef = collection(
    firestore,
    `/users/${user?.uid}/activeTopicSubscriptions/`
  )
  const [queryResult, setQueryResult] = useState("")

  const orgQuery = useCallback(async () => {
    const q = query(
      subscriptionRef,
      where("topicName", "==", `org-${profileId}`)
    )
    const querySnapshot = await getDocs(q)
    querySnapshot.forEach(doc => {
      // doc.data() is never undefined for query doc snapshots
      setQueryResult(doc.data().topicName)
    })
  }, [subscriptionRef, profileId, setQueryResult]) // dependencies of orgQuery

  useEffect(() => {
    user?.uid ? orgQuery() : null
  }, [user?.uid, orgQuery]) // dependencies of useEffect

  const handleFollowClick = async () => {
    // ensure user is not null
    if (!user) {
      throw new Error("User not found")
    }

    try {
      const orgLookup = {
        profileId: profileId,
        type: "testimony"
      }
      const token = await user.getIdToken()
      const response = await followBillFunction({ orgLookup, token })
      if (response.data) {
        setQueryResult(topicName)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleUnfollowClick = async () => {
    // ensure user is not null
    if (!user) {
      throw new Error("User not found")
    }

    try {
      const orgLookup = {
        profileId: profileId,
        type: "testimony"
      }
      const token = await user.getIdToken()
      const response = await unfollowBillFunction({ orgLookup, token })
      if (response.data) {
        setQueryResult("")
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleClick = () => {
    queryResult === topicName ? handleUnfollowClick() : handleFollowClick()
  }

  const text =
    queryResult === topicName ? t("button.following") : t("button.follow")
  const checkmark =
    queryResult === topicName ? (
      <StyledImage src="/check-white.svg" alt="checkmark" />
    ) : null

  return (
    <Col className={`d-flex w-100 justify-content-start`}>
      <div>
        <div className="view-edit-profile">
          <FillButton
            onClick={handleClick}
            className={`py-1`}
            Icon={checkmark}
            label={text}
          />
        </div>
      </div>
    </Col>
  )
}
