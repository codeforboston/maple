import { useEffect } from "react"
import type { ModalProps } from "react-bootstrap"
import { useForm } from "react-hook-form"
import { Button, Col, Form, Modal, Stack } from "../bootstrap"
import Divider from "../Divider/Divider"
import Input from "../forms/Input"
import PasswordInput from "../forms/PasswordInput"
import SocialSignOnButtons from "./SocialSignOnButtons"

type SignInData = { email: string; password: string }

export default function SignInModal({
  show,
  onHide,
  onForgotPassword
}: Pick<ModalProps, "show" | "onHide"> & {
  onForgotPassword: () => void
}) {
  const {
    register,
    handleSubmit,
    clearErrors,
    formState: { errors }
  } = useForm<SignInData>()

  useEffect(() => {
    if (!show) clearErrors()
  }, [show, clearErrors])

  const onSubmit = ({ email, password }: SignInData) => {
    console.log(email, password)
  }

  return (
    <Modal show={show} onHide={onHide} aria-labelledby="sign-in-modal" centered>
      <Modal.Header closeButton>
        <Modal.Title id="sign-in-modal">Sign In</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Col md={10} className="mx-auto">
          <Form
            noValidate
            onSubmit={handleSubmit(onSubmit)}
            className="d-flex flex-column align-items-center"
          >
            <Stack gap={2}>
              <Input
                label="Email"
                type="email"
                {...register("email", { required: "An email is required." })}
                error={errors.email?.message}
              />

              <PasswordInput
                label="Password"
                {...register("password", {
                  required: "A password is required."
                })}
                error={errors.password?.message}
              />
            </Stack>

            {/* TODO: fix focous ring color */}
            <Button
              variant="link"
              className="mt-2 mb-4 py-0 px-0"
              onClick={onForgotPassword}
            >
              Forgot password?
            </Button>

            <Stack gap={4}>
              <Button type="submit" className="w-100">
                Sign In
              </Button>

              <Divider className="px-4">or</Divider>

              <SocialSignOnButtons />
            </Stack>
          </Form>
        </Col>
      </Modal.Body>
    </Modal>
  )
}
