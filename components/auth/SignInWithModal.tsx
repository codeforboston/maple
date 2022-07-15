import { useState } from "react"
import { Button } from "../bootstrap"
import ForgotPasswordModal from "./ForgotPasswordModal"
import SignInModal from "./SignInModal"
import SignUpModal from "./SignUpModal"
import StartModal from "./StartModal"

export default function SignInWithModal({ label = "Sign In" }) {
  const [currentModal, setCurrentModal] = useState<
    "start" | "signIn" | "signUp" | "forgotPassword" | null
  >(null)

  const close = () => setCurrentModal(null)

  return (
    <>
      <Button variant="primary" onClick={() => setCurrentModal("start")}>
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
        onForgotPassword={() => setCurrentModal("forgotPassword")}
      />
      <SignUpModal show={currentModal === "signUp"} onHide={close} />
      <ForgotPasswordModal
        show={currentModal === "forgotPassword"}
        onHide={() => setCurrentModal("signIn")}
      />
    </>
  )
}
