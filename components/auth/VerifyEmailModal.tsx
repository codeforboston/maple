import type { ModalProps } from "react-bootstrap"
import { Button, Image, Col, Modal, Row, Stack } from "../bootstrap"
import styles from "./VerifyEmailModal.module.css"
import { Internal } from "components/links"

export default function VerifyEmailModal({
  show,
  onHide
}: Pick<ModalProps, "show" | "onHide">) {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton className={styles.modalHeader}>
        <Modal.Title id="tos-modal">Sign Up</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Col md={11} className="mx-auto">
          <Stack gap={3} direction="vertical" className="mb-4 text-center">
            <Image
              fluid
              className={styles.image}
              src="mailverify.svg"
              alt="Mail illustration"
            />
            <h2 className={styles.title}>Verify your email address</h2>
            <h6 className={styles.body}>
              Please verify your email for your account by clicking the
              verification link we sent to your email. You will be required to
              verify your email before submitting testimony.
            </h6>
            <Internal href="/editprofile" className="view-edit-profile">
              <Button onClick={onHide}>Set Up Your Profile</Button>
            </Internal>
          </Stack>
        </Col>
      </Modal.Body>
    </Modal>
  )
}
