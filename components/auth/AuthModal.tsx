import SignInModal from "./SignInModal"
import UserSignUpModal from "./UserSignUpModal"
import OrgSignUpModal from "./OrgSignUpModal"
import StartModal from "./StartModal"
import ForgotPasswordModal from "./ForgotPasswordModal"
import VerifyEmailModal from "./VerifyEmailModal"
import ProfileTypeModal from "./ProfileTypeModal"
import { AuthFlowStep, authStepChanged, useAuth } from "./redux"
import { useAppDispatch } from "components/hooks"
import { useRouter } from "next/router"

export default function AuthModal() {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const { authFlowStep: currentModal, isFromProtectedPage } = useAuth()
  const setCurrentModal = (step: AuthFlowStep) =>
    dispatch(authStepChanged(step))
  const close = () => {
    dispatch(authStepChanged(null))
    window.location.reload()
  }
  const closeModal = () => {
    dispatch(authStepChanged(null))
    if (isFromProtectedPage) {
      router.push("/")
    }
  }
  return (
    <>
      <StartModal
        show={currentModal === "start" || currentModal === "protectedpage"}
        onHide={closeModal}
        onSignInClick={() => setCurrentModal("signIn")}
        onSignUpClick={() => setCurrentModal("chooseProfileType")}
      />
      <ProfileTypeModal
        show={currentModal === "chooseProfileType"}
        onHide={closeModal}
        onIndividualUserClick={() => setCurrentModal("userSignUp")}
        onOrgUserClick={() => setCurrentModal("orgSignUp")}
      />
      <SignInModal
        show={currentModal === "signIn"}
        onHide={closeModal}
        onForgotPasswordClick={() => setCurrentModal("forgotPassword")}
      />
      <UserSignUpModal
        show={currentModal === "userSignUp"}
        onHide={closeModal}
        onSuccessfulSubmit={() => setCurrentModal("verifyEmail")}
      />
      <OrgSignUpModal
        show={currentModal === "orgSignUp"}
        onHide={closeModal}
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
