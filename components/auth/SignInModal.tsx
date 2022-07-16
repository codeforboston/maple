import { useEffect } from "react"
import type { ModalProps } from "react-bootstrap"
import { useForm } from "react-hook-form"
import { Alert, Button, Col, Form, Modal, Spinner, Stack } from "../bootstrap"
import Divider from "../Divider/Divider"
import Input from "../forms/Input"
import PasswordInput from "../forms/PasswordInput"
import {
  SignInWithEmailAndPasswordData,
  useSignInWithEmailAndPassword
} from "./hooks"
import SocialSignOnButtons from "./SocialSignOnButtons"

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
    reset,
    formState: { errors }
  } = useForm<SignInWithEmailAndPasswordData>()

  const signIn = useSignInWithEmailAndPassword()

  useEffect(() => {
    if (!show) {
      reset()
      signIn.reset()
    }
    // could not add a reference to signIn.reset to dep array without triggering an infinite effect, so:
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [show, reset])

  const onSubmit = (credentials: SignInWithEmailAndPasswordData) => {
    signIn.execute(credentials)
  }

  return (
    <Modal show={show} onHide={onHide} aria-labelledby="sign-in-modal" centered>
      <Modal.Header closeButton>
        <Modal.Title id="sign-in-modal">Sign In</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Col md={10} className="mx-auto">
          {signIn.error ? (
            <Alert variant="danger">{signIn.error.message}</Alert>
          ) : null}

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

            {/* TODO: fix focus ring color */}
            <Button
              variant="link"
              className="mt-2 mb-4 py-0 px-0"
              onClick={onForgotPassword}
            >
              Forgot password?
            </Button>

            <Stack gap={4}>
              <Button type="submit" className="w-100" disabled={signIn.loading}>
                {signIn.loading ? (
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
