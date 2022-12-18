import type { ModalProps } from "react-bootstrap"
import { Button, Col, Modal, Row, Stack } from "../bootstrap"
import styles from "./TermsOfService.module.css"
import SVG from "react-inlinesvg"

export default function VerifyEmailModal({
  show,
  onHide
}: Pick<ModalProps, "show" | "onHide">) {
  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title id="tos-modal">Sign Up</Modal.Title>
      </Modal.Header>
      <Modal.Body className={styles.text}>
        <Col md={12} className="mx-auto">
          <Stack gap={3} className="mb-4">
            This is the email verify modal
          </Stack>
        </Col>
      </Modal.Body>
    </Modal>
  )
}
