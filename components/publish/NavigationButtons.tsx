import clsx from "clsx"
import { useRouter } from "next/router"
import { ReactNode, useCallback } from "react"
import styled from "styled-components"
import { Button } from "../bootstrap"
import { useAppDispatch } from "../hooks"
import {
  nextStep,
  previousStep,
  setShowThankYou,
  Step,
  usePublishState
} from "./redux"
import { SendEmailButton } from "./SendEmailButton"

export const NavigationButtons = styled(({ className, ...rest }) => {
  const currentStep = usePublishState().step!,
    dispatch = useAppDispatch()

  const next = (
      <Button variant="outline-secondary" onClick={() => dispatch(nextStep())}>
        Next
      </Button>
    ),
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
    share = <ShareButton />,
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
})`
  .btn {
    min-width: 10rem;
    line-height: 2.5rem;
    padding: 0 0.5rem 0 0.5rem;
  }
`

const ShareButton = () => {
  const { share, bill } = usePublishState()
  const router = useRouter()
  const dispatch = useAppDispatch()
  const redirectToBill = useCallback(() => {
    dispatch(setShowThankYou(true))
    router.push(`/bill?id=${bill!.id}`)
  }, [bill, dispatch, router])

  if (share.recipients.length > 0) {
    return (
      <SendEmailButton
        onClick={() => {
          redirectToBill()
          // Delay opening the new tab until the draft gains focus
          // setTimeout(redirectToBill, 1000)
        }}
      />
    )
  } else if (!share.loading) {
    return (
      <Button variant="outline-secondary" onClick={redirectToBill}>
        Finish Without Emailing
      </Button>
    )
  } else {
    return <div />
  }
}
