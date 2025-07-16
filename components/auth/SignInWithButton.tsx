import { Button } from "../bootstrap"
import { useAppDispatch } from "../hooks"
import { AuthFlowStep, authStepChanged, useAuth } from "./redux"
import { useTranslation } from "next-i18next"

interface Props {
  label?: string
  className?: string
}

export default function SignInWithButton({ className }: Props) {
  const { t } = useTranslation("auth")
  const dispatch = useAppDispatch()
  const { justLoggedOut } = useAuth()
  const setCurrentModal = (step: AuthFlowStep) =>
    dispatch(authStepChanged(step))

  const handleClick = () => {
    if (!justLoggedOut) {
      setCurrentModal("start")
    }
  }

  return (
    <span className={className}>
      <Button variant="primary" className="w-100" onClick={handleClick}>
        {t("logInSignUp")}
      </Button>
    </span>
  )
}

export function AltSignInWithButton({ className }: Props) {
  const { t } = useTranslation("auth")
  const dispatch = useAppDispatch()
  const { justLoggedOut } = useAuth()
  const setCurrentModal = (step: AuthFlowStep) =>
    dispatch(authStepChanged(step))

  const handleClick = () => {
    if (!justLoggedOut) {
      setCurrentModal("start")
    }
  }

  return (
    <span className={className}>
      <Button variant="primary" className="w-100" onClick={handleClick}>
        {t("altLogInSignUp")}
      </Button>
    </span>
  )
}
