import { useEffect } from "react"
import type { ModalProps } from "react-bootstrap"
import { useForm } from "react-hook-form"
import { Alert, Button, Col, Form, Modal, Stack } from "../bootstrap"
import { LoadingButton } from "../buttons"
import Divider from "../Divider/Divider"
import Input from "../forms/Input"
import PasswordInput from "../forms/PasswordInput"
import {
  SignInWithEmailAndPasswordData,
  useSignInWithEmailAndPassword
} from "./hooks"
import SocialSignOnButtons from "./SocialSignOnButtons"
import { useTranslation } from "next-i18next"

export default function SignInModal({
  show,
  onHide,
  onLogin,
  onForgotPasswordClick
}: {
  show?: boolean
  onForgotPasswordClick: () => void
  onHide: () => void
  onLogin: () => void
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

  const onSubmit = handleSubmit(credentials => {
    signIn.execute(credentials).then(onLogin)
  })

  const { t } = useTranslation("auth")

  return (
    <Modal show={show} onHide={onHide} aria-labelledby="sign-in-modal" centered>
      <Modal.Header closeButton>
        <Modal.Title id="sign-in-modal">{t("signIn")}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Col md={10} className="mx-auto">
          {signIn.error ? (
            <Alert variant="danger">{signIn.error.message}</Alert>
          ) : null}

          <Form
            noValidate
            onSubmit={onSubmit}
            className="d-flex flex-column align-items-center"
          >
            <Stack gap={2}>
              <Input
                label={t("email")}
                type="email"
                {...register("email", {
                  required: t("emailIsRequired") ?? "An email is required."
                })}
                error={errors.email?.message}
              />

              <PasswordInput
                label={t("password")}
                {...register("password", {
                  required: t("passwordRequired") ?? "A password is required."
                })}
                error={errors.password?.message}
              />
            </Stack>

            <Button
              variant="link"
              className="mt-2 mb-4 py-0 px-0"
              onClick={onForgotPasswordClick}
            >
              {t("forgotPassword2")}
            </Button>

            <Stack gap={4}>
              <LoadingButton
                type="submit"
                className="w-100"
                loading={signIn.loading}
              >
                {t("signIn")}
              </LoadingButton>

              <Divider className="px-4">{t("or")}</Divider>

              <SocialSignOnButtons onComplete={onHide} />
            </Stack>
          </Form>
        </Col>
      </Modal.Body>
    </Modal>
  )
}
