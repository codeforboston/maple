import type { ModalProps } from "react-bootstrap"
import { Button, Col, Modal, Stack } from "../bootstrap"

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
      <Modal.Header closeButton closeVariant="white">
        <Modal.Title id="start-modal" className="visually-hidden">
          Sign Up or Sign In
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Col md={7} className="mx-auto">
          <div className="mb-5 text-center">
            <p>insert fancy graphic</p>

            <p className="h5">
              Add your voice to the conversation by becoming a member!
            </p>
          </div>

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
