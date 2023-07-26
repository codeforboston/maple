import SignInModal from "./SignInModal"
import UserSignUpModal from "./UserSignUpModal"
import OrgSignUpModal from "./OrgSignUpModal"
import StartModal from "./StartModal"
import ForgotPasswordModal from "./ForgotPasswordModal"
import VerifyEmailModal from "./VerifyEmailModal"
import ProfileTypeModal from "./ProfileTypeModal"
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
        onSignUpClick={() => setCurrentModal("chooseProfileType")}
      />
      <ProfileTypeModal
        show={currentModal === "chooseProfileType"}
        onHide={close}
        onIndividualUserClick={() => setCurrentModal("userSignUp")}
        onOrgUserClick={() => setCurrentModal("orgSignUp")}
      />
      <SignInModal
        show={currentModal === "signIn"}
        onHide={close}
        onForgotPasswordClick={() => setCurrentModal("forgotPassword")}
      />
      <UserSignUpModal
        show={currentModal === "userSignUp"}
        onHide={close}
        onSuccessfulSubmit={() => setCurrentModal("verifyEmail")}
      />
      <OrgSignUpModal
        show={currentModal === "orgSignUp"}
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
