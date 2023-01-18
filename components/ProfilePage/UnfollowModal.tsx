import type { ModalProps } from "react-bootstrap"
import { Button, Col, Form, Image, Modal, Stack } from "../bootstrap"
import { ProfileHook } from "../db"
import { formatBillId } from "../formatting"
import styles from "./NotificationSettingsgitModal.module.css"

type Props = Pick<ModalProps, "show" | "onHide"> & {
  currentBill: string
  onUnfollowModalClose: () => void
}

export default function UnfollowModal({
  currentBill,
  onHide,
  onUnfollowModalClose,
  show
}: Props) {
  return (
    <Modal
      show={show}
      onHide={onHide}
      aria-labelledby="unfollow-modal"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="unfollow-modal">Unfollow</Modal.Title>
      </Modal.Header>
      <Modal.Body className={`ms-auto me-auto ${styles.modalContainer}`}>
        <Stack className={`${styles.unfollowFontSize}`}>
          Are you sure you want to unfollow Bill {formatBillId(currentBill)}?
        </Stack>
      </Modal.Body>
    </Modal>
  )
}
