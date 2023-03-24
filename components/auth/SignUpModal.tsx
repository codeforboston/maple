import { useEffect, useState } from "react"
import clsx from "clsx"
import type { ModalProps } from "react-bootstrap"
import { useForm } from "react-hook-form"
import { Alert, Button, Col, Form, Modal, Row, Stack } from "../bootstrap"
import { LoadingButton } from "../buttons"
import Divider from "../Divider/Divider"
import Input from "../forms/Input"
import PasswordInput from "../forms/PasswordInput"
import {
  CreateUserWithEmailAndPasswordData,
  useCreateUserWithEmailAndPassword
} from "./hooks"
import SocialSignOnButtons from "./SocialSignOnButtons"
import TermsOfServiceModal from "./TermsOfServiceModal"

export default function SignUpModal({
  show,
  onHide,
  onSuccessfulSubmit
}: Pick<ModalProps, "show" | "onHide"> & {
  onSuccessfulSubmit: () => void
  onHide: () => void
}) {
  const {
    register,
    handleSubmit,
    reset,
    getValues,
    trigger,
    formState: { errors, isSubmitSuccessful }
  } = useForm<CreateUserWithEmailAndPasswordData>()

  const [tosStep, setTosStep] = useState<"not-agreed" | "reading" | "agreed">(
    "not-agreed"
  )

  const showTos = tosStep === "reading"

  const createUserWithEmailAndPassword = useCreateUserWithEmailAndPassword()

  useEffect(() => {
    if (!show) {
      reset()
      setTosStep("not-agreed")
      createUserWithEmailAndPassword.reset()
    }
    // could not add a reference to createUserWithEmailAndPassword.reset to dep array without triggering an infinite effect, so:
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [show, reset])

  const onSubmit = handleSubmit(newUser => {
    const promise = createUserWithEmailAndPassword.execute(newUser)
    promise.then(onSuccessfulSubmit).catch(err => {})
  })

  async function handleContinueClick() {
    const isValid = await trigger()
    if (isValid) {
      setTosStep("reading")
    }
  }

  useEffect(() => {
    if (tosStep == "agreed") {
      const loadingbtn = document.getElementById("loading-button")
      loadingbtn?.click()
    }
  }, [tosStep])

  return (
    <>
      <Modal
        show={show}
        onHide={onHide}
        aria-labelledby="sign-up-modal"
        centered
        size="lg"
        className={clsx(showTos && "opacity-0")}
      >
        <Modal.Header closeButton>
          <Modal.Title id="sign-up-modal">Sign Up</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Col md={12} className="mx-auto">
            {createUserWithEmailAndPassword.error ? (
              <Alert variant="danger">
                {createUserWithEmailAndPassword.error.message}
              </Alert>
            ) : null}

            <Form noValidate onSubmit={onSubmit}>
              <TermsOfServiceModal
                show={showTos}
                onHide={() => setTosStep("not-agreed")}
                onAgree={() => setTosStep("agreed")}
              />
              <Stack gap={3} className="mb-4">
                <Input
                  label="Email"
                  type="email"
                  {...register("email", { required: "An email is required." })}
                  error={errors.email?.message}
                />

                <Input
                  label="Full Name"
                  type="text"
                  {...register("fullName", {
                    required: "A full name is required."
                  })}
                  error={errors.fullName?.message}
                />

                <Input
                  label="Nickname"
                  type="text"
                  {...register("nickname", {
                    required: "A nickname is required."
                  })}
                  error={errors.nickname?.message}
                />

                <Row className="g-3">
                  <Col md={6}>
                    <PasswordInput
                      label="Password"
                      {...register("password", {
                        required: "A password is required.",
                        minLength: {
                          value: 8,
                          message:
                            "Your password must be 8 characters or longer."
                        },
                        deps: ["confirmedPassword"]
                      })}
                      error={errors.password?.message}
                    />
                  </Col>

                  <Col md={6}>
                    <PasswordInput
                      label="Confirm Password"
                      {...register("confirmedPassword", {
                        required: "You must confirm your password.",
                        validate: confirmedPassword => {
                          const password = getValues("password")
                          return confirmedPassword !== password
                            ? "Confirmed password must match password."
                            : undefined
                        }
                      })}
                      error={errors.confirmedPassword?.message}
                    />
                  </Col>
                </Row>
              </Stack>

              <Stack gap={4}>
                {tosStep == "agreed" ? (
                  <LoadingButton
                    id="loading-button"
                    type="submit"
                    className="w-100"
                    loading={createUserWithEmailAndPassword.loading}
                  >
                    Sign up
                  </LoadingButton>
                ) : (
                  <Button type="button" onClick={handleContinueClick}>
                    Continue
                  </Button>
                )}

                <Divider className="px-4">or</Divider>

                <SocialSignOnButtons onComplete={onHide} />
              </Stack>
            </Form>
          </Col>
        </Modal.Body>
      </Modal>
    </>
  )
}
