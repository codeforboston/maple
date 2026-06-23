import { useEffect, useMemo, useState } from "react"
import clsx from "clsx"
import type { ModalProps } from "react-bootstrap"
import { useForm } from "react-hook-form"
import { Alert, Button, Col, Form, Modal, Row, Stack } from "../bootstrap"
import { LoadingButton } from "../buttons"
import Input from "../forms/Input"
import PasswordInput from "../forms/PasswordInput"
import {
  CreateLegislatorWithEmailAndPasswordData,
  useCreateLegislatorWithEmailAndPassword
} from "./hooks"
import TermsOfServiceModal from "./TermsOfServiceModal"
import { useTranslation } from "next-i18next"
import { Search } from "../legislatorSearch"
import { useClaimedMemberCodes, useMemberSearch } from "../db/members"
import { ProfileMember } from "../db"

export default function LegislatorSignUpModal({
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
    formState: { errors }
  } = useForm<CreateLegislatorWithEmailAndPasswordData>()

  const [tosStep, setTosStep] = useState<"not-agreed" | "reading" | "agreed">(
    "not-agreed"
  )
  const [selectedMember, setSelectedMember] = useState<ProfileMember | null>(
    null
  )
  const [memberError, setMemberError] = useState<string | undefined>()

  const showTos = tosStep === "reading"

  const createLegislatorWithEmailAndPassword =
    useCreateLegislatorWithEmailAndPassword()

  const { index } = useMemberSearch()
  const { claimedCodes } = useClaimedMemberCodes()

  const memberIndex = useMemo(() => {
    const all = [...(index?.representatives ?? []), ...(index?.senators ?? [])]
    if (!claimedCodes) return all
    return all.filter(m => !claimedCodes.has(m.MemberCode))
  }, [index, claimedCodes])

  const { t } = useTranslation("auth")

  useEffect(() => {
    if (!show) {
      reset()
      setTosStep("not-agreed")
      setSelectedMember(null)
      setMemberError(undefined)
      createLegislatorWithEmailAndPassword.reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, reset])

  const onSubmit = handleSubmit(newUser => {
    if (!selectedMember) {
      setMemberError(
        t("legislatorRequired") ?? "Please select your legislator profile."
      )
      return
    }
    setMemberError(undefined)
    const promise = createLegislatorWithEmailAndPassword.execute({
      ...newUser,
      memberCode: selectedMember.id
    })
    promise.then(onSuccessfulSubmit).catch(() => {})
  })

  async function handleContinueClick() {
    if (!selectedMember) {
      setMemberError(
        t("legislatorRequired") ?? "Please select your legislator profile."
      )
      return
    }
    setMemberError(undefined)
    const isValid = await trigger()
    if (isValid) {
      setTosStep("reading")
    }
  }

  useEffect(() => {
    if (tosStep === "agreed") {
      const loadingbtn = document.getElementById("legislator-loading-button")
      loadingbtn?.click()
    }
  }, [tosStep])

  return (
    <>
      <Modal
        show={show}
        onHide={onHide}
        aria-labelledby="legislator-sign-up-modal"
        centered
        size="lg"
        className={clsx(showTos && "opacity-0")}
      >
        <Modal.Header closeButton>
          <Modal.Title id="legislator-sign-up-modal">
            {t("signUpAsLegislator") ?? "Sign Up as Legislator"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Col md={12} className="mx-auto">
            {createLegislatorWithEmailAndPassword.error ? (
              <Alert variant="danger">
                {createLegislatorWithEmailAndPassword.error.message}
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
                  label={t("email") ?? "Email"}
                  type="email"
                  {...register("email", {
                    required: t("emailIsRequired") ?? "An email is required."
                  })}
                  error={errors.email?.message}
                />

                <Input
                  label={t("fullName") ?? "Full Name"}
                  type="text"
                  {...register("fullName", {
                    validate: value =>
                      value.trim().length >= 2 ||
                      t("errEmptyAndMinLength").toString(),
                    required: t("nameIsRequired") ?? "A full name is required."
                  })}
                  error={errors.fullName?.message}
                />

                <Form.Group controlId="legislatorSearch">
                  <Form.Label>{t("selectLegislatorHeader")}</Form.Label>
                  <Search
                    index={memberIndex}
                    update={member => {
                      setSelectedMember(member)
                      if (member) setMemberError(undefined)
                    }}
                    memberId={selectedMember?.id}
                    placeholder={t("searchLegislatorsPlaceholder")}
                    menuPortalTarget={document.body}
                    styles={{
                      menuPortal: (base: any) => ({ ...base, zIndex: 9999 })
                    }}
                  />
                  {memberError && (
                    <Form.Text className="text-danger">{memberError}</Form.Text>
                  )}
                </Form.Group>

                <Row className="g-3">
                  <Col md={6}>
                    <PasswordInput
                      label={t("password") ?? "Password"}
                      {...register("password", {
                        required:
                          t("passwordRequired") ?? "A password is required.",
                        minLength: {
                          value: 8,
                          message:
                            t("passwordLength") ??
                            "Your password must be 8 characters or longer."
                        },
                        deps: ["confirmedPassword"]
                      })}
                      error={errors.password?.message}
                    />
                  </Col>

                  <Col md={6}>
                    <PasswordInput
                      label={t("confirmPassword") ?? "Confirm Password"}
                      {...register("confirmedPassword", {
                        required:
                          t("mustConfirmPassword") ??
                          "You must confirm your password.",
                        validate: confirmedPassword => {
                          const password = getValues("password")
                          return confirmedPassword !== password
                            ? t("mustMatch") ??
                                "Confirmed password must match password."
                            : undefined
                        }
                      })}
                      error={errors.confirmedPassword?.message}
                    />
                  </Col>
                </Row>
              </Stack>
              {tosStep === "agreed" ? (
                <LoadingButton
                  id="legislator-loading-button"
                  type="submit"
                  className="w-100"
                  loading={createLegislatorWithEmailAndPassword.loading}
                >
                  {t("signUp") ?? "Sign Up"}
                </LoadingButton>
              ) : (
                <Button
                  className="w-100"
                  type="button"
                  onClick={handleContinueClick}
                >
                  {t("continue") ?? "Continue"}
                </Button>
              )}
            </Form>
          </Col>
        </Modal.Body>
      </Modal>
    </>
  )
}
