import type { ModalProps } from "react-bootstrap"
import { Button, Col, Image, Modal, Stack } from "../bootstrap"

export default function NotificationSettingsModal({
  show,
  onHide
}: Pick<ModalProps, "show" | "onHide">) {
  return (
    <Modal
      show={show}
      onHide={onHide}
      aria-labelledby="notifications-modal"
      centered
    ></Modal>
  )
}
