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
  const followUserFunction = httpsCallable(functions, "followUser")
  const unfollowUserFunction = httpsCallable(functions, "unfollowUser")

  const topicName = `testimony-${profileId}`
  const subscriptionRef = collection(
    firestore,
    `/users/${user?.uid}/activeTopicSubscriptions/`
  )
  const [queryResult, setQueryResult] = useState("")

  const userQuery = useCallback(async () => {
    const q = query(
      subscriptionRef,
      where("topicName", "==", `testimony-${profileId}`)
    )
    const querySnapshot = await getDocs(q)
    querySnapshot.forEach(doc => {
      // doc.data() is never undefined for query doc snapshots
      setQueryResult(doc.data().topicName)
    })
  }, [subscriptionRef, profileId, setQueryResult]) // dependencies of orgQuery

  useEffect(() => {
    user?.uid ? userQuery() : null
  }, [user?.uid, userQuery]) // dependencies of useEffect

  const handleFollowClick = async () => {
    // ensure user is not null
    if (!user) {
      throw new Error("User not found")
    }

    try {
      const userLookup = {
        profileId: profileId,
        type: "testimony"
      }
      const token = await user.getIdToken()
      const response = await followUserFunction({ userLookup, token })
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
      const userLookup = {
        profileId: profileId,
        type: "testimony"
      }
      const token = await user.getIdToken()
      const response = await unfollowUserFunction({ userLookup, token })
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
