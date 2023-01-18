import type { ModalProps } from "react-bootstrap"
import { Button, Modal, Stack } from "../bootstrap"
import { formatBillId } from "../formatting"
import styles from "./NotificationSettingsModal.module.css"

type Props = Pick<ModalProps, "show" | "onHide"> & {
  currentBill: string
  handleUnfollowClick: (bid: string) => Promise<void>
  onUnfollowModalClose: () => void
}

export default function UnfollowModal({
  currentBill,
  handleUnfollowClick,
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
        <Stack className={`mt-4`} direction={`horizontal`}>
          <Button
            className={`
                btn btn-sm btn-outline-secondary ms-auto py-1 ${styles.modalButtonLength}`}
            onClick={onUnfollowModalClose}
          >
            No
          </Button>
          <Button
            className={`
                btn btn-sm ms-3 me-auto py-1 ${styles.modalButtonLength}`}
            onClick={async () => {
              handleUnfollowClick(currentBill)
            }}
          >
            Yes
          </Button>
        </Stack>
      </Modal.Body>
    </Modal>
  )
}
