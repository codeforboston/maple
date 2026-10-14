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
        <SplitLabel label={label ?? t("logInSignUp")} />
      </Button>
    </span>
  )
}

/* A label such as "Log in / Sign up" in halves that each keep to one line
   under Digital Democracy and Mixed (styles/globals.css), so a narrow button
   wraps after the slash rather than inside "Sign up". The text is unchanged,
   and under Maple the halves are plain spans. */
const SplitLabel = ({ label }: { label: string }) => {
  const halves = label.split(" / ")
  if (halves.length !== 2) return <>{label}</>
  return (
    <>
      <span className="sign-in-label-half">{halves[0]} /</span>{" "}
      <span className="sign-in-label-half">{halves[1]}</span>
    </>
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
