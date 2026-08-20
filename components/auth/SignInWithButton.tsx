import { Button } from "../bootstrap"
import { useAppDispatch } from "../hooks"
import { AuthFlowStep, authStepChanged } from "./redux"
import { useTranslation } from "next-i18next"

interface Props {
  label?: string
  className?: string
  buttonClassName?: string
}

export default function SignInWithButton({
  label,
  className,
  buttonClassName
}: Props) {
  const { t } = useTranslation("auth")
  const dispatch = useAppDispatch()
  const setCurrentModal = (step: AuthFlowStep) =>
    dispatch(authStepChanged(step))

  return (
    <span className={className ?? "d-block"}>
      <Button
        variant="primary"
        className={`w-100 ${buttonClassName ?? ""}`.trim()}
        onClick={() => setCurrentModal("start")}
      >
        {label ?? t("logInSignUp")}
      </Button>
    </span>
  )
}

export function AltSignInWithButton({
  label,
  className,
  buttonClassName
}: Props) {
  const { t } = useTranslation("auth")
  const dispatch = useAppDispatch()
  const setCurrentModal = (step: AuthFlowStep) =>
    dispatch(authStepChanged(step))

  return (
    <span className={className ?? "d-block"}>
      <Button
        variant="primary"
        className={`w-100 ${buttonClassName ?? ""}`.trim()}
        onClick={() => setCurrentModal("start")}
      >
        {label ?? t("altLogInSignUp")}
      </Button>
    </span>
  )
}
