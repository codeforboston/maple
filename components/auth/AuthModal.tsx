import SignInModal from "./SignInModal"
import SignUpModal from "./SignUpModal"
import StartModal from "./StartModal"
import ForgotPasswordModal from "./ForgotPasswordModal"
import VerifyEmailModal from "./VerifyEmailModal"
import { AuthFlowStep, authStepChanged, useAuth } from "./redux"
import { useAppDispatch } from "components/hooks"

export default function AuthModal() {
  const dispatch = useAppDispatch()
  const { authFlowStep: currentModal } = useAuth()
  const setCurrentModal = (step: AuthFlowStep) =>
    dispatch(authStepChanged(step))
  const close = () => dispatch(authStepChanged(null))

  return (
    <>
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
      <SignUpModal
        show={currentModal === "signUp"}
        onHide={close}
        onSuccessfulSubmit={() => setCurrentModal("verifyEmail")}
      />
      <VerifyEmailModal show={currentModal === "verifyEmail"} onHide={close} />
      <ForgotPasswordModal
        show={currentModal === "forgotPassword"}
        onHide={() => setCurrentModal("signIn")}
      />
    </>
  )
}
