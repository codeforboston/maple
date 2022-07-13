import { useState } from "react"
import { Button } from "../bootstrap"
import SignInModal from "./SignInModal"
import SignUpModal from "./SignUpModal"
import StartModal from "./StartModal"

export default function SignInWithModal({ label = "Sign In" }) {
  const [currentModal, setCurrentModal] = useState<
    "start" | "signIn" | "signUp" | null
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
      <SignInModal show={currentModal === "signIn"} onHide={close} />
      <SignUpModal show={currentModal === "signUp"} onHide={close} />
    </>
  )
}
