import type { ModalProps } from "react-bootstrap"
import { Button, Col, Image, Modal, Stack } from "../bootstrap"
import styles from "./StartModal.module.css"

export default function StartModal({
  show,
  onHide,
  onSignInClick,
  onSignUpClick
}: Pick<ModalProps, "show" | "onHide"> & {
  onSignInClick: () => void
  onSignUpClick: () => void
}) {
  return (
    <Modal show={show} onHide={onHide} aria-labelledby="start-modal" centered>
      <Modal.Header closeButton className={styles.modalHeader}>
        <Modal.Title id="start-modal" className="visually-hidden">
          Sign Up or Sign In
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Col md={7} className="mx-auto">
          <Stack gap={3} direction="vertical" className="mb-4 text-center">
            <Image
              fluid
              src="/fancy-govt-with-bg.png"
              alt="Government Building"
            />

            <p className="h5">
              Add your voice to the conversation by becoming a member!
            </p>
          </Stack>

          <Stack gap={3}>
            <Button onClick={onSignUpClick}>Sign Up</Button>
            <Button variant="outline-primary" onClick={onSignInClick}>
              Sign In
            </Button>
          </Stack>
        </Col>
      </Modal.Body>
    </Modal>
  )
}
