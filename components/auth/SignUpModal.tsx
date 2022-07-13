import React from "react"
import type { ModalProps } from "react-bootstrap"
import { Button, Col, FloatingLabel, Form, Modal, Stack } from "../bootstrap"
import Divider from "../Divider/Divider"
import FirebaseAuth from "./FirebaseAuth"

export default function SignInModal({
  show,
  onHide
}: Pick<ModalProps, "show" | "onHide">) {
  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault()
  }

  return (
    <Modal show={show} onHide={onHide} aria-labelledby="sign-up-modal" centered>
      <Modal.Header closeButton closeVariant="white">
        <Modal.Title id="sign-up-modal">Sign Up</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Col md={10} className="mx-auto">
          <Form onSubmit={handleSignUp}>
            <FloatingLabel controlId="email" label="Email" className="mb-3">
              <Form.Control
                id="email"
                type="email"
                placeholder="name@example.com"
              />
            </FloatingLabel>

            <FloatingLabel
              controlId="password"
              label="Password"
              className="mb-2"
            >
              <Form.Control id="password" type="password" placeholder="123" />
            </FloatingLabel>

            <Stack gap={4}>
              <Button type="submit" className="w-100">
                Sign In
              </Button>

              <Divider>or</Divider>

              <FirebaseAuth borderless />
            </Stack>
          </Form>
        </Col>
      </Modal.Body>
    </Modal>
  )
}
