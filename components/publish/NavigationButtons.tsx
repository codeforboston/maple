import clsx from "clsx"
import { ReactNode } from "react"
import { ButtonProps } from "react-bootstrap"
import styled from "styled-components"
import { Button } from "../bootstrap"
import { useAppDispatch } from "../hooks"
import { nextStep, previousStep, Step, usePublishState } from "./redux"
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
      <div className="d-flex justify-content-between flex-wrap gap-2 mt-1">
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
    const dispatch = useAppDispatch()
    const synced = usePublishState().sync === "synced"
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

export const Next = createNavButton(nextStep, "Next")
export const Previous = createNavButton(previousStep, "Previous")

export const NavigationButtons = styled(({ className, ...rest }) => {
  const currentStep = usePublishState().step!,
    dispatch = useAppDispatch()

  const next = <Next />,
    previous = (
      <Button
        variant="outline-secondary"
        onClick={() => dispatch(previousStep())}
      >
        Previous
      </Button>
    ),
    publish = (
      <Button variant="secondary" onClick={() => dispatch(nextStep())}>
        Publish & Proceed
      </Button>
    ),
    share = <div />,
    space = <div />

  const options: Record<Step, [ReactNode, ReactNode]> = {
      position: [space, next],
      write: [previous, next],
      publish: [previous, publish],
      selectLegislators: [space, next],
      share: [space, share]
    },
    [left, right] = options[currentStep]

  return (
    <div
      className={clsx(
        "d-flex justify-content-between flex-wrap gap-2",
        className
      )}
      {...rest}
    >
      {left}
      {right}
    </div>
  )
})``
