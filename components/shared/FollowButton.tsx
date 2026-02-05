import { StyledImage } from "components/ProfilePage/StyledProfileComponents"
import { useTranslation } from "next-i18next"
import { useEffect, useContext, useMemo, useState } from "react"
import { Button } from "react-bootstrap"
import { useAuth } from "../auth"
import { Bill } from "../db"
import {
  followsTopic,
  followBill,
  followProfile,
  unfollowBill,
  unfollowProfile,
  billTopicName,
  profileTopicName
} from "./FollowingQueries"
import { FollowContext } from "./FollowContext"
import { Modal } from "components/bootstrap"
import { FillButton, OutlineButton } from "components/buttons"
import { formatBillId } from "components/formatting"

export function FollowUserButton({
  profileId,
  confirmFollow,
  confirmUnfollow,
  userName
}: {
  profileId: string
  confirmFollow?: boolean
  confirmUnfollow?: boolean
  userName?: string
}) {
  const uid = useAuth().user?.uid
  return (
    <BaseFollowButton
      topicName={profileTopicName(profileId)}
      followAction={() => followProfile(uid, profileId)}
      unfollowAction={() => unfollowProfile(uid, profileId)}
      confirmFollow={confirmFollow}
      confirmUnfollow={confirmUnfollow}
      displayName={userName}
    />
  )
}

export function FollowBillButton({
  bill,
  confirmFollow,
  confirmUnfollow
}: {
  bill: Bill
  confirmFollow?: boolean
  confirmUnfollow?: boolean
}) {
  const uid = useAuth().user?.uid
  return (
    <BaseFollowButton
      topicName={billTopicName(bill.court, bill.id)}
      followAction={() => followBill(uid, bill)}
      unfollowAction={() => unfollowBill(uid, bill)}
      confirmFollow={confirmFollow}
      confirmUnfollow={confirmUnfollow}
      displayName={useTranslation("testimony").t("bill", {
        billId: formatBillId(bill.id)
      })}
    />
  )
}

export const BaseFollowButton = ({
  topicName,
  followAction,
  unfollowAction,
  hide,
  confirmFollow = false,
  confirmUnfollow = false,
  displayName = ""
}: {
  topicName: string
  followAction: () => Promise<void>
  unfollowAction: () => Promise<void>
  hide?: boolean
  confirmFollow?: boolean
  confirmUnfollow?: boolean
  displayName?: string
}) => {
  const { t } = useTranslation("common")
  const uid = useAuth().user?.uid
  const { followStatus, setFollowStatus } = useContext(FollowContext)
  const [modalAction, setModalAction] = useState<"follow" | "unfollow" | null>(
    null
  )

  useEffect(() => {
    if (!uid) return
    followsTopic(uid, topicName).then(result =>
      setFollowStatus(prev => ({ ...prev, [topicName]: result }))
    )
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
  const onClick = isFollowing
    ? () => (confirmUnfollow ? setModalAction("unfollow") : UnfollowClick())
    : () => (confirmFollow ? setModalAction("follow") : FollowClick())

  return (
    <>
      {!hide && (
        <div className="follow-button">
          <Button onClick={onClick} className={`btn btn-lg py-1`}>
            {t(`button.${isFollowing ? "unfollow" : "follow"}`)}
            {isFollowing && <StyledImage src="/check-white.svg" alt="" />}
          </Button>
        </div>
      )}
      <ConfirmFollowModal
        action={modalAction}
        displayName={displayName}
        onCancel={() => setModalAction(null)}
        onConfirm={() =>
          modalAction === "follow" ? FollowClick() : UnfollowClick()
        }
      />
    </>
  )
}

function ConfirmFollowModal({
  action,
  displayName,
  onCancel,
  onConfirm
}: {
  action: "follow" | "unfollow" | null
  displayName: string
  onCancel: () => void
  onConfirm: () => void | Promise<void>
}) {
  const { t } = useTranslation("common")

  const title = useMemo(
    () => (action === "unfollow" ? t("button.unfollow") : t("button.follow")),
    [action, t]
  )

  const message = useMemo(
    () => t(`confirmation.${action}Message`, { displayName }),
    [action, displayName, t]
  )

  return (
    <Modal
      show={action !== null}
      onHide={onCancel}
      aria-labelledby="follow-modal"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="follow-modal">{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="ms-auto me-auto p-3">
        <div className="d-flex flex-wrap text-center px-5">{message}</div>
        <div className="d-flex gap-3 px-2 col-6 mt-4 mr-4">
          <OutlineButton
            className="col-3 ms-auto"
            onClick={onCancel}
            label={t("confirmation.no")}
          />
          <FillButton
            className="col-3 me-auto"
            onClick={onConfirm}
            label={t("confirmation.yes")}
          />
        </div>
      </Modal.Body>
    </Modal>
  )
}
