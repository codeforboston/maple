import type { ModalProps } from "react-bootstrap"
import { Button, Col, Container, Image, Modal, Row, Stack } from "../bootstrap"
import styles from "./NotificationSettingsModal.module.css"

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
    >
      <Modal.Header closeButton>
        <Modal.Title id="notifications-modal">Settings</Modal.Title>
      </Modal.Header>
      <Modal.Body className={styles.thinContainer}>
        <Row>&nbsp; Notifications</Row>
        <Row>
          <hr />
        </Row>
        <Row>&nbsp; Profile Settings</Row>
        <Row>
          <hr />
        </Row>
      </Modal.Body>
    </Modal>
  )
}
