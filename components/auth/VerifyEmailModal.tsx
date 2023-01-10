import type { ModalProps } from "react-bootstrap"
import { Button, Image, Col, Modal, Row, Stack } from "../bootstrap"
import styles from "./VerifyEmailModal.module.css"
import SVG from "react-inlinesvg"

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
            <h6 className={styles.body}>Please verify your email for you account by clicking the verification link we send to your email. If you fail to do so, you will not be able to submit your testimonies.</h6>
            
          </Stack>
        </Col>
      </Modal.Body>
    </Modal>
  )
}
