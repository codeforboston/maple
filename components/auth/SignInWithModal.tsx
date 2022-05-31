import { useRouter } from "next/router"
import { useState, useCallback } from "react"
import { Button, Modal } from "../bootstrap"
import FirebaseAuth from "./FirebaseAuth"

export default function SignInWithModal({ label="Sign In"}) {
  const [show, setShow] = useState(false)

  return (
    <>
      <Button className="btn-primary" onClick={() => setShow(true)}>
        {label}
      </Button>
      <Modal
        show={show}
        onHide={() => setShow(false)}
        aria-labelledby="login-modal"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title id="login-modal">Sign In to Testify</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <FirebaseAuth borderless />
        </Modal.Body>
      </Modal>
    </>
  )
}
