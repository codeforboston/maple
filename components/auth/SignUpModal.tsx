import { useEffect, useState} from "react"
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
import styles from "./SignUpModal.module.css"
import { required } from "yargs"

export default function SignUpModal({
  show,
  onHide
}: Pick<ModalProps, "show" | "onHide">) {
  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors }
  } = useForm<CreateUserWithEmailAndPasswordData>()
  const [tosStep, setTosStep] = useState<"not-agreed" | "reading" | "agreed">(
    "not-agreed"
  )

  const showTos = tosStep === "reading"

  const createUserWithEmailAndPassword = useCreateUserWithEmailAndPassword()

  useEffect(() => {
    if (!show) {
      reset()
      createUserWithEmailAndPassword.reset()
    }
    // could not add a reference to createUserWithEmailAndPassword.reset to dep array without triggering an infinite effect, so:
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [show, reset])

  const onSubmit = handleSubmit(newUser => {
    createUserWithEmailAndPassword.execute(newUser)
  })

  return (
    <>

    <Modal
      show={show}
      onHide={onHide}
      aria-labelledby="sign-up-modal"
      centered
      size="lg"
      className={clsx(showTos && "d-none")}
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
              onAgree={() => setTosStep("agreed")
            }
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
                        message: "Your password must be 8 characters or longer."
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
              <Col className={styles.agreebox}>
                <b>In order to continue you must agree to the <a className={styles.modallink} onClick={() => setTosStep("reading")}>privacy policy and terms of use</a></b>
                <Form.Check 
                  inline 
                  required
                  label="I agree to terms of service" 
                  feedback="You must agree before submitting"
                  type="checkbox"
                  className={styles.checkbox}
                />
              </Col>
            </Stack>

            <Stack gap={4}>
              <LoadingButton
                type="submit"
                className="w-100"
                loading={createUserWithEmailAndPassword.loading}
              >
                Sign Up
              </LoadingButton>

              <Divider className="px-4">or</Divider>

              <SocialSignOnButtons />
            </Stack>
          </Form>
        </Col>
      </Modal.Body>
    </Modal>
    </>
  )
}

