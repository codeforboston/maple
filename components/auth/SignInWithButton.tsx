import { Button } from "../bootstrap"
import { useAppDispatch } from "../hooks"
import { AuthFlowStep, authStepChanged } from "./redux"

interface Props {
  label?: string
  className?: string
}

export default function SignInWithButton({
  label = "Log in / Sign up",
  className
}: Props) {
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
        {label}
      </Button>
    </span>
  )
}
