import clsx from "clsx"
import { ReactNode } from "react"
import { ButtonProps } from "react-bootstrap"
import { Button } from "../bootstrap"
import { useAppDispatch } from "../hooks"
import { usePublishState } from "./hooks"
import { nextStep, previousStep } from "./redux"
import { SyncStatus } from "./SyncStatus"

type FormNavigationProps = {
  className?: string
  status?: boolean
  left?: ReactNode
  right?: ReactNode
}

export const FormNavigation = ({
  status = false,
  left = <div />,
  right = <div />,
  className
}: FormNavigationProps) => {
  return (
    <div className={clsx("mt-4 mb-4", className)}>
      {status && <SyncStatus />}
      <div className="d-flex align-items-end justify-content-between flex-wrap gap-2 mt-1">
        {left}
        {right}
      </div>
    </div>
  )
}

export const NavButton = ({ className, ...props }: ButtonProps) => (
  <Button className={clsx("form-navigation-btn", className)} {...props} />
)

const createNavButton = (actionCreator: any, label: string) => {
  const StyledNavButton = ({ disabled, ...props }: ButtonProps) => {
    const dispatch = useAppDispatch(),
      sync = usePublishState().sync,
      synced = sync === "synced" || sync === "error"
    return (
      <NavButton
        variant="outline-secondary"
        onClick={() => dispatch(actionCreator())}
        disabled={disabled || !synced}
        {...props}
      >
        {label}
      </NavButton>
    )
  }
  return StyledNavButton
}

export const Next = createNavButton(nextStep, "Next >>")
export const Previous = createNavButton(previousStep, "<< Previous")
