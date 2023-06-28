import { useTranslation } from "next-i18next"
import { useState, useEffect } from "react"
import { Col, Button } from "react-bootstrap"
import { useAuth } from "../auth"
import { Bill } from "../db"
import { setFollow, setUnfollow, TopicQuery } from "./FollowingQueries"
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

  const [queryResult, setQueryResult] = useState("")

  useEffect(() => {
    uid
      ? TopicQuery(uid, topicName).then(result => setQueryResult(result))
      : null
  }, [uid, topicName, setQueryResult])

  const FollowClick = async () => {
    setFollow(uid, topicName, bill, billId, courtId, profileid)
    setQueryResult(topicName)
  }

  const UnfollowClick = async () => {
    setUnfollow(uid, topicName)
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
    <div>
      <div>
        <div className="follow-button">
          <Button onClick={clickFunction} className={`btn btn-lg py-1`}>
            {text}
            {checkmark}
          </Button>
        </div>
      </div>
    </div>
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
