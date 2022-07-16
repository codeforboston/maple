import { useEffect } from "react"
import type { ModalProps } from "react-bootstrap"
import { useForm } from "react-hook-form"
import { Alert, Button, Col, Form, Image, Modal, Spinner } from "../bootstrap"
import Input from "../forms/Input"
import { SendPasswordResetEmailData, useSendPasswordResetEmail } from "./hooks"

export default function ForgotPasswordModal({
  show,
  onHide
}: Pick<ModalProps, "show" | "onHide">) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<SendPasswordResetEmailData>()

  const sendPasswordResetEmail = useSendPasswordResetEmail()

  useEffect(() => {
    if (!show) {
      reset()
      sendPasswordResetEmail.reset()
    }
    // could not add a reference to sendPasswordResetEmail.reset to dep array without triggering an infinite effect, so:
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [show, reset])

  const onSubmit = (userToSendEmailTo: SendPasswordResetEmailData) => {
    sendPasswordResetEmail.execute(userToSendEmailTo)
  }

  return (
    <Modal
      show={show}
      onHide={onHide}
      aria-labelledby="forgot-password-modal"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="forgot-password-modal">
          Forgot your password?
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Col md={10} className="mx-auto">
          <div className="d-flex flex-column align-items-center mb-2">
            <Image src="mail.png" alt="Mail entering mailbox" fluid />

            {sendPasswordResetEmail.status === "success" ? (
              <div role="alert" className="h5">
                Check your inbox!
              </div>
            ) : (
              <p className="h5">We'll email you with a link to reset it.</p>
            )}
          </div>

          {sendPasswordResetEmail.error ? (
            <Alert variant="danger">
              {sendPasswordResetEmail.error.message}
            </Alert>
          ) : null}

          <Form noValidate onSubmit={handleSubmit(onSubmit)}>
            <Input
              label="Email"
              type="email"
              {...register("email", { required: "An email is required." })}
              error={errors.email?.message}
              className="mb-4"
            />

            <Button type="submit" className="w-100">
              {sendPasswordResetEmail.loading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden
                    className="me-2"
                  />
                  <span className="visually-hidden">Loading...</span>
                </>
              ) : null}
              Send Recovery Email
            </Button>
          </Form>
        </Col>
      </Modal.Body>
    </Modal>
  )
}
