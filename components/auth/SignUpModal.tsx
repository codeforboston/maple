import { useEffect } from "react"
import type { ModalProps } from "react-bootstrap"
import { useForm } from "react-hook-form"
import { Button, Col, Form, Modal, Row, Stack } from "../bootstrap"
import Divider from "../Divider/Divider"
import Input from "../forms/Input"
import PasswordInput from "../forms/PasswordInput"
import SocialSignOnButtons from "./SocialSignOnButtons"

type SignUpData = {
  email: string
  fullName: string
  nickname: string
  password: string
  confirmedPassword: string
}

export default function SignUpModal({
  show,
  onHide
}: Pick<ModalProps, "show" | "onHide">) {
  const {
    register,
    handleSubmit,
    clearErrors,
    getValues,
    formState: { errors }
  } = useForm<SignUpData>()

  useEffect(() => {
    if (!show) clearErrors()
  }, [show, clearErrors])

  const onSubmit = (signUpData: SignUpData) => {
    console.log(signUpData)
  }

  return (
    <Modal
      show={show}
      onHide={onHide}
      aria-labelledby="sign-up-modal"
      centered
      size="lg"
    >
      <Modal.Header closeButton>
        <Modal.Title id="sign-up-modal">Sign Up</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Col md={11} className="mx-auto">
          <Form noValidate onSubmit={handleSubmit(onSubmit)}>
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
                      }
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
              <Button type="submit" className="w-100">
                Sign Up
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
