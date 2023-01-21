import { useEffect } from "react"
import type { ModalProps } from "react-bootstrap"
import { useForm } from "react-hook-form"
import { Alert, Col, Form, Image, Modal, Stack } from "../bootstrap"
import { LoadingButton } from "../buttons"
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

  const onSubmit = handleSubmit(passwordResetData => {
    sendPasswordResetEmail.execute(passwordResetData)
  })

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
          <Stack direction="vertical" className="align-items-center mb-2">
            <Image src="/mail.png" alt="Mail entering mailbox" fluid />

            {sendPasswordResetEmail.status === "success" ? (
              <div role="alert" className="h5 text-center">
                Check your inbox! If you don't see anything, be sure to check
                your spam folder.
              </div>
            ) : (
              <p className="h5">We'll email you with a link to reset it.</p>
            )}
          </Stack>

          {sendPasswordResetEmail.error ? (
            <Alert variant="danger">
              {sendPasswordResetEmail.error.message}
            </Alert>
          ) : null}

          {sendPasswordResetEmail.status !== "success" ? (
            <Form noValidate onSubmit={onSubmit}>
              <Input
                label="Email"
                type="email"
                {...register("email", { required: "An email is required." })}
                error={errors.email?.message}
                className="mb-3"
              />

              <LoadingButton
                type="submit"
                className="w-100"
                loading={sendPasswordResetEmail.loading}
              >
                Send Recovery Email
              </LoadingButton>
            </Form>
          ) : null}
        </Col>
      </Modal.Body>
    </Modal>
  )
}
