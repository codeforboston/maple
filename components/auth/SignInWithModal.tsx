import { useState } from "react"
import { Button } from "../bootstrap"
import ForgotPasswordModal from "./ForgotPasswordModal"
import SignInModal from "./SignInModal"
import SignUpModal from "./SignUpModal"
import StartModal from "./StartModal"
import TermsOfServiceModal from "./TermsOfServiceModal"

interface Props {
  label?: string
  className?: string
}

export default function SignInWithModal({
  label = "Log in / Sign up",
  className
}: Props) {
  const [currentModal, setCurrentModal] = useState<
    "start" | "signIn" | "signUp" | "forgotPassword" | null
  >(null)

  const close = () => setCurrentModal(null)
  return (
    <span className={className}>
      <Button
        variant="primary"
        className="w-100"
        onClick={() => setCurrentModal("start")}
      >
        {label}
      </Button>

      <StartModal
        show={currentModal === "start"}
        onHide={close}
        onSignInClick={() => setCurrentModal("signIn")}
        onSignUpClick={() => setCurrentModal("signUp")}
      />
      <SignInModal
        show={currentModal === "signIn"}
        onHide={close}
        onForgotPasswordClick={() => setCurrentModal("forgotPassword")}
      />
      <SignUpModal show={currentModal === "signUp"} onHide={close} />
      <ForgotPasswordModal
        show={currentModal === "forgotPassword"}
        onHide={() => setCurrentModal("signIn")}
      />
    </span>
  )
}
