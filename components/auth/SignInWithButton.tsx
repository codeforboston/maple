import { useAppDispatch } from "components/hooks"
import { Button } from "../bootstrap"
import { AuthFlowStep, authStepChanged, useAuth } from "./redux"


interface Props {
  label?: string
  className?: string
}

export default function SignInWithButton({
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
    </span>
  )
}
