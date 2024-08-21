import { Button } from "../bootstrap"
import { useAppDispatch } from "../hooks"
import { AuthFlowStep, authStepChanged } from "./redux"
import { useTranslation } from "next-i18next"

interface Props {
  label?: string
  className?: string
}

export default function SignInWithButton({ className }: Props) {
  const { t } = useTranslation("auth")
  const dispatch = useAppDispatch()
  const setCurrentModal = (step: AuthFlowStep) =>
    dispatch(authStepChanged(step))

  return (
    <span className={className}>
      <Button
        variant="primary"
        className="w-100"
        onClick={() => setCurrentModal("start")}
      >
        {t("logInSignUp")}
      </Button>
    </span>
  )
}

export function AltSignInWithButton({ className }: Props) {
  const { t } = useTranslation("auth")
  const dispatch = useAppDispatch()
  const setCurrentModal = (step: AuthFlowStep) =>
    dispatch(authStepChanged(step))

  return (
    <span className={className}>
      <Button
        variant="primary"
        className="w-100"
        onClick={() => setCurrentModal("start")}
      >
        {t("altLogInSignUp")}
      </Button>
    </span>
  )
}
