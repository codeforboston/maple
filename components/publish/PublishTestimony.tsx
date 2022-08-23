import { isRejected } from "@reduxjs/toolkit"
import { useAsyncCallback } from "react-async-hook"
import styled from "styled-components"
import { LoadingButton } from "../buttons"
import { useAppDispatch } from "../hooks"
import {
  publishTestimonyAndProceed,
  useFormRedirection,
  usePublishState
} from "./hooks"
import * as nav from "./NavigationButtons"
import { StepHeader } from "./StepHeader"
import { TestimonyPreview } from "./TestimonyPreview"

type UsePublisTestimony = ReturnType<typeof usePublishTestimony>
function usePublishTestimony() {
  const dispatch = useAppDispatch()
  const { sync, draft, publication } = usePublishState()
  const publish = useAsyncCallback(async () => {
    const result = await dispatch(publishTestimonyAndProceed())
    // pass error through to useAsync
    if (isRejected(result)) throw result.error
  })
  const alreadyPublished = Boolean(
      draft?.publishedVersion !== undefined && publication
    ),
    synced = sync === "synced" || sync === "error"

  useFormRedirection()

  return { synced, alreadyPublished, publish }
}

export const PublishTestimony = styled(({ ...rest }) => {
  const publish = usePublishTestimony(),
    error = publish.publish.error

  return (
    <div {...rest}>
      <StepHeader>Confirm Your Choices</StepHeader>
      <div className="testimony-container mt-4">
        <div className="title">Your Testimony</div>
        <TestimonyPreview />
      </div>

      {error && <div className="mt-2 text-danger">Error: {error.message}</div>}

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

const PublishButton = ({ publish }: { publish: UsePublisTestimony }) => {
  return (
    <LoadingButton
      disabled={publish.alreadyPublished || !publish.synced}
      loading={publish.publish.loading}
      className="form-navigation-btn"
      variant="secondary"
      onClick={publish.publish.execute}
    >
      {publish.alreadyPublished ? "Already Published" : "Publish & Proceed"}
    </LoadingButton>
  )
}
