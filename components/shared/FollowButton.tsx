import { StyledImage } from "components/ProfilePage/StyledProfileComponents"
import { useTranslation } from "next-i18next"
import React, { useEffect, useContext, useState } from "react"
import { useAuth } from "../auth"
import { Bill } from "../db"
import { TopicQuery, setFollow, setUnfollow } from "./FollowingQueries"
import { FollowContext } from "./FollowContext"
import { Button, Modal } from "../bootstrap"
import { FillButton, OutlineButton } from "components/buttons"
import { formatBillId } from "components/formatting"
import { FollowUserData } from "components/EditProfilePage/FollowersTab"

const ConfirmFollowToggleModal = ({
  show,
  displayName,
  onConfirm,
  onDeny,
  action
}: {
  show: boolean
  displayName: string
  onConfirm: () => Promise<void>
  onDeny: () => Promise<void>
  action: "follow" | "unfollow"
}) => {
  const { t } = useTranslation("common")
  return (
    <Modal
      show={show}
      onHide={onDeny}
      aria-labelledby={`${action}-modal`}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id={`${action}-modal`}>
          {t(`button.follow.${action}`)}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className={`ms-auto me-auto p-3 `}>
        <div className={`d-flex flex-wrap text-center px-5`}>
          {t("button.follow.confirmation_modal.message", {
            action,
            name: displayName
          })}
        </div>
        <div className={`d-flex gap-3 px-2 col-6 mt-4 mr-4`}>
          <OutlineButton
            className={`col-3 ms-auto`}
            onClick={onDeny}
            label={t("button.follow.confirmation_modal.no")}
          />
          <FillButton
            className={`col-3 me-auto`}
            onClick={onConfirm}
            label={t("button.follow.confirmation_modal.yes")}
          />
        </div>
      </Modal.Body>
    </Modal>
  )
}

export const BaseFollowButton = ({
  topicName,
  followAction,
  unfollowAction,
  confirmFollow,
  confirmUnfollow,
  displayName,
  hide
}: {
  topicName: string
  followAction: () => Promise<void>
  unfollowAction: () => Promise<void>
  confirmFollow?: boolean
  confirmUnfollow?: boolean
  displayName: string
  hide?: boolean
}) => {
  const { t } = useTranslation("common")

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
  const text = t(`button.follow.${isFollowing ? "following" : "follow"}`)
  const checkmark = isFollowing ? (
    <StyledImage src="/check-white.svg" alt="" />
  ) : null
  const handleClick = async () =>
    wantsConfirm ? setShowModal(true) : await toggleFollow()
  const [showModal, setShowModal] = useState(false)
  const wantsConfirm = isFollowing ? confirmUnfollow : confirmFollow

  const toggleFollow = async () => {
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
      <ConfirmFollowToggleModal
        show={showModal}
        onConfirm={async () => {
          await toggleFollow()
          setShowModal(false)
        }}
        onDeny={async () => setShowModal(false)}
        displayName={displayName}
        action={isFollowing ? "unfollow" : "follow"}
      />
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
  profileId,
  fullName,
  modalConfig
}: FollowUserData & {
  modalConfig?: Omit<
    React.ComponentProps<typeof BaseFollowButton>,
    "topicName" | "displayName" | "followAction" | "unfollowAction"
  >
}) {
  const { user } = useAuth()
  const uid = user?.uid
  const topicName = `testimony-${profileId}`
  const { t } = useTranslation("common")
  const followAction = () =>
    setFollow(uid, topicName, undefined, undefined, undefined, profileId)
  const unfollowAction = () => setUnfollow(uid, topicName)

  return (
    <BaseFollowButton
      topicName={topicName}
      followAction={followAction}
      unfollowAction={unfollowAction}
      displayName={fullName || t("modal.this_user")}
      {...modalConfig}
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
      displayName={formatBillId(billId)}
    />
  )
}
