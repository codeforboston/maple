import { StyledImage } from "components/ProfilePage/StyledProfileComponents"
import { useTranslation } from "next-i18next"
import { useEffect, useContext } from "react"
import { Button } from "react-bootstrap"
import { useAuth } from "../auth"
import { Bill } from "../db"
import { TopicQuery, setFollow, setUnfollow } from "./FollowingQueries"
import { FollowContext } from "./FollowContext"

export const BaseFollowButton = ({
  topicName,
  followAction,
  unfollowAction,
  hide
}: {
  topicName: string
  followAction: () => Promise<void>
  unfollowAction: () => Promise<void>
  hide?: boolean
}) => {
  const { t } = useTranslation(["profile"])

  const { user } = useAuth()
  const uid = user?.uid

  const { followStatus, setFollowStatus } = useContext(FollowContext)

  useEffect(() => {
    uid
      ? TopicQuery(uid, topicName).then(result => {
          setFollowStatus(prevOrgFollowGroup => {
            return { ...prevOrgFollowGroup, [topicName]: Boolean(result) }
          })
        })
      : null
  }, [uid, topicName, setFollowStatus])

  const FollowClick = async () => {
    await followAction()
    setFollowStatus({ ...followStatus, [topicName]: true })
  }

  const UnfollowClick = async () => {
    await unfollowAction()
    setFollowStatus({ ...followStatus, [topicName]: false })
  }

  const isFollowing = followStatus[topicName]
  const text = isFollowing ? t("button.following") : t("button.follow")
  const checkmark = isFollowing ? (
    <StyledImage src="/check-white.svg" alt="" />
  ) : null
  const handleClick = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    isFollowing ? UnfollowClick() : FollowClick()
  }

  return (
    <>
      {!hide && (
        <ButtonWithCheckmark
          checkmark={checkmark}
          handleClick={handleClick}
          text={text}
        />
      )}
    </>
  )
}

export const ButtonWithCheckmark = ({
  checkmark,
  handleClick,
  text,
  className
}: {
  checkmark: JSX.Element | null
  handleClick: any
  text: string
  className?: string
}) => {
  return (
    <div className="follow-button">
      <Button onClick={handleClick} className={`btn btn-lg py-1 ${className}`}>
        {text}
        {checkmark}
      </Button>
    </div>
  )
}

export function FollowUserButton({
  className,
  profileId
}: {
  className?: string
  profileId: string
}) {
  const { user } = useAuth()
  const uid = user?.uid
  const topicName = `testimony-${profileId}`
  const followAction = () =>
    setFollow(uid, topicName, undefined, undefined, undefined, profileId)
  const unfollowAction = () => setUnfollow(uid, topicName)

  return (
    <BaseFollowButton
      topicName={topicName}
      followAction={followAction}
      unfollowAction={unfollowAction}
    />
  )
}

export function FollowBillButton({ bill }: { bill: Bill }) {
  const { user } = useAuth()
  const uid = user?.uid
  const { id: billId, court: courtId } = bill
  const topicName = `bill-${courtId}-${billId}`
  const followAction = () =>
    setFollow(uid, topicName, bill, billId, courtId, undefined)
  const unfollowAction = () => setUnfollow(uid, topicName)

  return (
    <BaseFollowButton
      topicName={topicName}
      followAction={followAction}
      unfollowAction={unfollowAction}
    />
  )
}
