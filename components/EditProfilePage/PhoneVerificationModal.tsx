import {
  type ConfirmationResult,
  linkWithPhoneNumber,
  RecaptchaVerifier
} from "firebase/auth"
import { useEffect, useRef, useState } from "react"
import type { ModalProps } from "react-bootstrap"
import { Alert, Col, Form, Modal } from "../bootstrap"
import { LoadingButton } from "../buttons"
import Input from "../forms/Input"
import { useAuth } from "../auth"
import { getErrorMessage } from "../auth/hooks"
import { useCompletePhoneVerification } from "../auth/hooks"
import { auth } from "../firebase"
import { useTranslation } from "next-i18next"

const US_REGEX = /^(\([2-9][0-9]{2}\)|[2-9][0-9]{2})[- ]?([0-9]{3})[- ]?([0-9]{4})$/;

const AUTH_ERROR_CODE_TO_KEY: Record<string, string> = {
  "auth/credential-already-in-use": "phoneVerification.errors.credentialAlreadyInUse",
  "auth/provider-already-linked": "phoneVerification.errors.providerAlreadyLinked",
  "auth/invalid-phone-number": "phoneVerification.errors.invalidPhoneNumber",
  "auth/operation-not-allowed": "phoneVerification.errors.operationNotAllowed"
}

export default function PhoneVerificationModal({
  show,
  onHide
}: Pick<ModalProps, "show" | "onHide">) {
  const { t } = useTranslation("editProfile")
  const { user } = useAuth()
  const completePhoneVerification = useCompletePhoneVerification()

  const [step, setStep] = useState<"phone" | "code">("phone")
  const [phone, setPhone] = useState("")
  const [code, setCode] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [sendingCode, setSendingCode] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [confirmationResult, setConfirmationResult] =
    useState<ConfirmationResult | null>(null)
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null)
  const phoneInputRef = useRef<HTMLInputElement | null>(null)
  const codeInputRef = useRef<HTMLInputElement | null>(null)
  const RECAPTCHA_CONTAINER_ID = "phone-verification-recaptcha-container"

  const getModalErrorMessage = (code: string | undefined) => {
    if (!code) return getErrorMessage(code)
    const key = AUTH_ERROR_CODE_TO_KEY[code]
    return key ? t(key) : getErrorMessage(code)
  }

  useEffect(() => {
    if (!show) {
      setStep("phone")
      setPhone("")
      setCode("")
      setError(null)
      setConfirmationResult(null)
      setSendingCode(false)
      setVerifying(false)
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear()
        } catch {
          // ignore if already cleared
        }
        recaptchaVerifierRef.current = null
      }
      completePhoneVerification.reset()
    }
    // could not add a reference to completePhoneVerification.reset to dep array without triggering an infinite effect, so:
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [show])

  const handleSendCode = async () => {
    setError(null)
    const trimmed = phone.trim()
    if (!US_REGEX.test(trimmed)) {
      setError(getModalErrorMessage("auth/invalid-phone-number"))
      return
    }
    const phoneDigits = trimmed.replace(/\D/g, "");
    const firebasePhoneFormat = `+1${phoneDigits}`;

    if (!user) {
      setError(t("phoneVerification.signedInRequired"))
      return
    }

    setSendingCode(true)
    try {
      if (!recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current = new RecaptchaVerifier(
          RECAPTCHA_CONTAINER_ID,
          { size: "invisible" },
          auth
        )
      }
      const result = await linkWithPhoneNumber(
        user,
        firebasePhoneFormat,
        recaptchaVerifierRef.current
      )
      setConfirmationResult(result)
      setStep("code")
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code
      setError(
        getModalErrorMessage(code) ||
          (err as Error)?.message ||
          getErrorMessage()
      )
    } finally {
      setSendingCode(false)
    }
  }

  const handleVerify = async () => {
    setError(null)
    if (!confirmationResult || !code.trim()) {
      setError(t("phoneVerification.enterVerificationCode"))
      return
    }
    setVerifying(true)
    try {
      await confirmationResult.confirm(code.trim())
      if (completePhoneVerification.execute) {
        await completePhoneVerification.execute()
      }
      onHide?.()
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code
      setError(
        getModalErrorMessage(code) ||
          (err as Error)?.message ||
          getErrorMessage()
      )
    } finally {
      setVerifying(false)
    }
  }

  useEffect(() => {
    if (!show) return
    const el = step === "phone" ? phoneInputRef.current : codeInputRef.current
    if (el) {
      const id = requestAnimationFrame(() => el.focus())
      return () => cancelAnimationFrame(id)
    }
  }, [show, step])

  return (
    <Modal
      show={show}
      onHide={onHide}
      aria-labelledby="phone-verification-modal"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="phone-verification-modal">
          {t("phoneVerificationModalTitle")}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Col md={10} className="mx-auto">
          {error ? (
            <Alert variant="danger" dismissible onClose={() => setError(null)}>
              <span style={{ whiteSpace: "pre-line" }}>{error}</span>
            </Alert>
          ) : null}

          {step === "phone" ? (
            <Form
              noValidate
              onSubmit={e => {
                e.preventDefault()
                handleSendCode()
              }}
            >
              <Input
                ref={phoneInputRef}
                label={t("phoneVerification.phoneLabel")}
                type="tel"
                placeholder={t("phoneVerification.phonePlaceholder")}
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="mb-3"
              />
              <div id={RECAPTCHA_CONTAINER_ID} />
              <LoadingButton
                type="submit"
                className="w-100"
                loading={sendingCode}
              >
                {t("phoneVerification.continue")}
              </LoadingButton>
            </Form>
          ) : (
            <Form
              noValidate
              onSubmit={e => {
                e.preventDefault()
                handleVerify()
              }}
            >
              <Input
                ref={codeInputRef}
                label={t("phoneVerification.codeLabel")}
                type="text"
                placeholder={t("phoneVerification.codePlaceholder")}
                value={code}
                onChange={e => setCode(e.target.value)}
                className="mb-3"
              />
              <LoadingButton
                type="submit"
                className="w-100"
                loading={verifying}
              >
                {t("phoneVerification.verify")}
              </LoadingButton>
            </Form>
          )}
        </Col>
      </Modal.Body>
    </Modal>
  )
}
