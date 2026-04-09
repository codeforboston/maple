import { Card, ListItem, ListItemProps } from "components/Card"
import { dbService } from "components/db/api"
import { useFlags } from "components/featureFlags"
import { formatBillId } from "components/formatting"
import { formUrl } from "components/publish"
import { FC, ReactElement, useContext, useEffect, useState } from "react"
import { useCurrentTestimonyDetails } from "./testimonyDetailSlice"
import { useTranslation } from "next-i18next"
import { useAuth } from "components/auth"
import {
  ballotQuestionTopicName,
  billTopicName,
  followBallotQuestion,
  followBill,
  followsTopic,
  unfollowBallotQuestion,
  unfollowBill
} from "components/shared/FollowingQueries"
import { StyledImage } from "components/ProfilePage/StyledProfileComponents"
import { FollowContext } from "components/shared/FollowContext"
import { isActiveBallotQuestionPhase } from "components/ballotquestions/status"

interface PolicyActionsProps {
  className?: string
  isUser?: boolean
  isReporting: boolean
  setReporting: (boolean: boolean) => void
}

const PolicyActionItem: FC<React.PropsWithChildren<ListItemProps>> = props => (
  <ListItem action active={false} variant="secondary" {...props} />
)

export const PolicyActions: FC<React.PropsWithChildren<PolicyActionsProps>> = ({
  className,
  isUser,
  isReporting,
  setReporting
}) => {
  const { bill, revision } = useCurrentTestimonyDetails(),
    billLabel = formatBillId(bill.id)
  const { notifications } = useFlags()

  const { user } = useAuth()
  const uid = user?.uid
  const ballotQuestionId = revision.ballotQuestionId ?? undefined
  const ballotQuestionTopic = ballotQuestionId
    ? { court: bill.court, id: ballotQuestionId }
    : null
  const policyLabel = ballotQuestionTopic
    ? `Ballot Question ${ballotQuestionTopic.id}`
    : billLabel
  const topicName = ballotQuestionTopic
    ? ballotQuestionTopicName(ballotQuestionTopic.court, ballotQuestionTopic.id)
    : billTopicName(bill.court, bill.id)

  const { followStatus, setFollowStatus } = useContext(FollowContext)
  const [canEditBallotQuestionTestimony, setCanEditBallotQuestionTestimony] =
    useState(!ballotQuestionId)

  useEffect(() => {
    uid
      ? followsTopic(uid, topicName).then(result => {
          setFollowStatus(prev => ({ ...prev, [topicName]: result }))
        })
      : null
  }, [uid, topicName, setFollowStatus])

  useEffect(() => {
    if (!ballotQuestionId) {
      setCanEditBallotQuestionTestimony(true)
      return
    }

    let active = true
    dbService()
      .getBallotQuestion({ id: ballotQuestionId })
      .then(ballotQuestion => {
        if (!active) return
        setCanEditBallotQuestionTestimony(
          !!ballotQuestion &&
            isActiveBallotQuestionPhase(ballotQuestion.ballotStatus)
        )
      })
      .catch(() => {
        if (active) setCanEditBallotQuestionTestimony(false)
      })

    return () => {
      active = false
    }
  }, [ballotQuestionId])

  const FollowClick = async () => {
    if (ballotQuestionTopic) {
      await followBallotQuestion(uid, ballotQuestionTopic)
    } else {
      await followBill(uid, bill)
    }
    setFollowStatus(prev => ({ ...prev, [topicName]: true }))
  }

  const UnfollowClick = async () => {
    if (ballotQuestionTopic) {
      await unfollowBallotQuestion(uid, ballotQuestionTopic)
    } else {
      await unfollowBill(uid, bill)
    }
    setFollowStatus(prev => ({ ...prev, [topicName]: false }))
  }

  const isFollowing = followStatus[topicName]
  const text = isFollowing ? "Unfollow" : "Follow"
  const checkmark = isFollowing ? (
    <StyledImage src="/check-white.svg" alt="" />
  ) : null
  const handleClick = (event: React.MouseEvent<Element, MouseEvent>) => {
    event.preventDefault()
    isFollowing ? UnfollowClick() : FollowClick()
  }

  const items: ReactElement[] = []
  if (notifications)
    items.push(
      <PolicyActionItem
        onClick={e => handleClick(e)}
        key="follow"
        billName={`${text} ${policyLabel}`}
      />
    )
  items.push(
    <PolicyActionItem
      key="report-testimony"
      billName={`Report Testimony`}
      onClick={() => setReporting(!isReporting)}
    />
  )
  if (canEditBallotQuestionTestimony)
    items.push(
      <PolicyActionItem
        key="add-testimony"
        billName={`${isUser ? "Edit" : "Add"} Testimony for ${policyLabel}`}
        href={formUrl(bill.id, bill.court, "position", ballotQuestionId)}
      />
    )

  const { t } = useTranslation("testimony")

  return (
    <Card
      className={className}
      header={t("policyActions.actions") ?? "Actions"}
      items={items}
    />
  )
}
