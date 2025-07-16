import SignInModal from "./SignInModal"
import UserSignUpModal from "./UserSignUpModal"
import OrgSignUpModal from "./OrgSignUpModal"
import StartModal from "./StartModal"
import ForgotPasswordModal from "./ForgotPasswordModal"
import VerifyEmailModal from "./VerifyEmailModal"
import ProfileTypeModal from "./ProfileTypeModal"
import {
  AuthFlowStep,
  authStepChanged,
  useAuth,
  setProtectedPageAccess
} from "./redux"
import { useAppDispatch } from "components/hooks"
import { useRouter } from "next/router"
import { useEffect } from "react"

export default function AuthModal() {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const {
    authFlowStep: currentModal,
    loading,
    isFromProtectedPage,
    protectedPageUrl,
    authenticated,
    user,
    justLoggedOut
  } = useAuth()
  const setCurrentModal = (step: AuthFlowStep) =>
    dispatch(authStepChanged(step))

  const close = () => {
    dispatch(authStepChanged(null))
    if (isFromProtectedPage) {
      dispatch(
        setProtectedPageAccess({ isFromProtectedPage: false, url: undefined })
      )
      router.push("/")
    }
  }

  useEffect(() => {
    if (
      isFromProtectedPage &&
      authenticated &&
      user &&
      currentModal === null &&
      !loading
    ) {
      if (protectedPageUrl) {
        dispatch(
          setProtectedPageAccess({ isFromProtectedPage: false, url: undefined })
        )
        router.push(protectedPageUrl)
      }
    }
  }, [
    isFromProtectedPage,
    authenticated,
    user,
    currentModal,
    loading,
    protectedPageUrl,
    router,
    dispatch
  ])

  if (loading || justLoggedOut) return null

  return (
    <>
      <StartModal
        show={currentModal === "start"}
        onHide={close}
        onSignInClick={() => setCurrentModal("signIn")}
        onSignUpClick={() => setCurrentModal("chooseProfileType")}
        isFromProtectedPage={isFromProtectedPage}
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
