import { Card, ListItem, ListItemProps } from "components/Card"
import { useFlags } from "components/featureFlags"
import { formatBillId } from "components/formatting"
import { formUrl } from "components/publish"
import { FC, ReactElement, useContext, useEffect } from "react"
import { useCurrentTestimonyDetails } from "./testimonyDetailSlice"
import { useTranslation } from "next-i18next"
import { useAuth } from "components/auth"
import { TopicQuery } from "components/shared/FollowingQueries"
import { StyledImage } from "components/ProfilePage/StyledProfileComponents"
import { FollowContext } from "components/shared/FollowContext"

interface PolicyActionsProps {
  className?: string
  isUser?: boolean
  isReporting: boolean
  setReporting: (boolean: boolean) => void
  topicName: string
  followAction: () => Promise<void>
  unfollowAction: () => Promise<void>
}

const PolicyActionItem: FC<React.PropsWithChildren<ListItemProps>> = props => (
  <ListItem action active={false} variant="secondary" {...props} />
)

export const PolicyActions: FC<React.PropsWithChildren<PolicyActionsProps>> = ({
  className,
  isUser,
  isReporting,
  setReporting,
  topicName,
  followAction,
  unfollowAction
}) => {
  const { bill } = useCurrentTestimonyDetails(),
    billLabel = formatBillId(bill.id)
  const { notifications } = useFlags()

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
    setFollowStatus(prev => ({ ...prev, [topicName]: true }))
  }

  const UnfollowClick = async () => {
    await unfollowAction()
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
        billName={`${text} ${billLabel}`}
      />
    )
  items.push(
    <PolicyActionItem
      key="report-testimony"
      billName={`Report Testimony`}
      onClick={() => setReporting(!isReporting)}
    />
  )
  items.push(
    <PolicyActionItem
      key="add-testimony"
      billName={`${isUser ? "Edit" : "Add"} Testimony for ${billLabel}`}
      href={formUrl(bill.id, bill.court)}
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
