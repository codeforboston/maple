import { useRouter } from "next/router"
import { useState, useCallback } from "react"
import { Button, Modal } from "../bootstrap"
import FirebaseAuth from "./FirebaseAuth"

export default function SignInWithModal() {
  const [show, setShow] = useState(false)

  return (
    <>
      <Button onClick={() => setShow(true)}>Sign In</Button>
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
