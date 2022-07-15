import { useEffect } from "react"
import type { ModalProps } from "react-bootstrap"
import { useForm } from "react-hook-form"
import { Button, Col, Form, Image, Modal } from "../bootstrap"
import Input from "../forms/Input"

type ForgotPasswordData = { email: string }

export default function ForgotPasswordModal({
  show,
  onHide
}: Pick<ModalProps, "show" | "onHide">) {
  const {
    register,
    handleSubmit,
    clearErrors,
    formState: { errors }
  } = useForm<ForgotPasswordData>()

  useEffect(() => {
    if (!show) clearErrors()
  }, [show, clearErrors])

  const onSubmit = ({ email }: ForgotPasswordData) => {
    console.log(email)
    // https://firebase.google.com/docs/auth/web/manage-users#send_a_password_reset_email
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

            <p className="h5">We'll email you with a link to reset it.</p>
          </div>

          <Form noValidate onSubmit={handleSubmit(onSubmit)}>
            <Input
              label="Email"
              type="email"
              {...register("email", { required: "An email is required." })}
              error={errors.email?.message}
              className="mb-4"
            />

            <Button type="submit" className="w-100">
              Send Recovery Email
            </Button>
          </Form>
        </Col>
      </Modal.Body>
    </Modal>
  )
}
