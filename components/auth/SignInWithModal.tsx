import { useAppDispatch } from "components/hooks"
import { Button } from "../bootstrap"
import ForgotPasswordModal from "./ForgotPasswordModal"
import { AuthFlowStep, authStepChanged, useAuth } from "./redux"
import SignInModal from "./SignInModal"
import SignUpModal from "./SignUpModal"
import StartModal from "./StartModal"

interface Props {
  label?: string
  className?: string
}

export default function SignInWithModal({
  label = "Log in / Sign up",
  className
}: Props) {
  const dispatch = useAppDispatch()
  const { authFlowStep: currentModal } = useAuth()
  const setCurrentModal = (step: AuthFlowStep) =>
    dispatch(authStepChanged(step))
  const close = () => dispatch(authStepChanged(null))

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
