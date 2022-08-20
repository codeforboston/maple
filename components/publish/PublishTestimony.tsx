import { isRejected } from "@reduxjs/toolkit"
import { useAsyncCallback, UseAsyncReturn } from "react-async-hook"
import styled from "styled-components"
import { LoadingButton } from "../buttons"
import { useAppDispatch } from "../hooks"
import { publishTestimonyAndProceed } from "./hooks"
import * as nav from "./NavigationButtons"
import { usePublishState } from "./redux"
import { StepHeader } from "./StepHeader"
import { TestimonyPreview } from "./TestimonyPreview"

const maxLength = 1000

export const PublishTestimony = styled(({ ...rest }) => {
  const dispatch = useAppDispatch()
  const { content, sync } = usePublishState()
  const publish = useAsyncCallback(async () => {
    const result = await dispatch(publishTestimonyAndProceed())
    // pass error through to useAsync
    if (isRejected(result)) throw result.error
  })

  if (sync !== "synced") return null

  return (
    <div {...rest}>
      <StepHeader>Confirm Your Choices</StepHeader>
      <div className="testimony-container mt-4">
        <div className="title">Your Testimony</div>
        <TestimonyPreview />
      </div>

      {publish.error && <div>Error: {publish.error}</div>}

      <nav.FormNavigation
        left={<nav.Previous />}
        right={<PublishButton publish={publish} />}
      />
    </div>
  )
})`
  @media (min-width: 768px) {
    .testimony-container {
      padding: 3rem 4rem 3rem 4rem !important;
    }
  }

  .testimony-container {
    color: white;
    padding: 1rem;
    background-color: var(--bs-blue);
    border-radius: 1rem;
  }

  .title {
    font-weight: bold;
    font-size: 1.25rem;
    text-align: center;
    margin-bottom: 1rem;
  }
`

type PublishAction = UseAsyncReturn<void, []>

const PublishButton = ({ publish }: { publish: PublishAction }) => {
  return (
    <LoadingButton
      loading={publish.loading}
      className="form-navigation-btn"
      variant="secondary"
      onClick={publish.execute}
    >
      Publish & Proceed
    </LoadingButton>
  )
}
