import type { ModalProps } from "react-bootstrap"
import styled from "styled-components"
import { Button, Modal, Stack } from "../bootstrap"
import { formatBillId } from "../formatting"
import { useTranslation } from "next-i18next"
import { FillButton, OutlineButton } from "components/buttons"

type Props = Pick<ModalProps, "show" | "onHide"> & {
  handleUnfollowClick: (
    unfollowItem: UnfollowModalConfig | null
  ) => Promise<void>
  onHide: () => void
  onUnfollowClose: () => void
  show: boolean
  unfollowItem: UnfollowModalConfig | null
}

export type UnfollowModalConfig = {
  court: number
  orgName: string
  type: string
  typeId: string
}

export default function UnfollowItem({
  handleUnfollowClick,
  onHide,
  onUnfollowClose,
  show,
  unfollowItem
}: Props) {
  const { t } = useTranslation("editProfile")

  const handleTopic = () => {
    if (unfollowItem?.type == "bill") {
      return ` Bill ${formatBillId(unfollowItem?.typeId)}`
    } else {
      return ` ${unfollowItem?.orgName}`
    }
  }

  return (
    <Modal
      show={show}
      onHide={onHide}
      aria-labelledby="unfollow-modal"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="unfollow-modal">{t("follow.unfollow")}</Modal.Title>
      </Modal.Header>
      <Modal.Body className={`ms-auto me-auto p-3 `}>
        <div className={`d-flex flex-wrap text-center px-5`}>
          {t("confirmation.unfollowMessage")}
          {handleTopic()}?
        </div>
        <div className={`d-flex gap-3 px-2 col-6 mt-4 mr-4`}>
          <OutlineButton
            className={`col-3 ms-auto`}
            onClick={onUnfollowClose}
            label={t("confirmation.no")}
          />
          <FillButton
            className={`col-3 me-auto`}
            onClick={async () => {
              handleUnfollowClick(unfollowItem)
            }}
            label={t("confirmation.yes")}
          />
        </div>
      </Modal.Body>
    </Modal>
  )
}
