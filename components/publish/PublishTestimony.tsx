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
import { SelectRecipients } from "./SelectRecipients"
import { ShareButtons } from "./ShareTestimony"
import { StepHeader } from "./StepHeader"
import { YourTestimony } from "./TestimonyPreview"

type UsePublishTestimony = ReturnType<typeof usePublishTestimony>
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
      <StepHeader>Confirm and Send</StepHeader>
      <SelectRecipients className="mt-4" />
      <YourTestimony className="mt-4" />

      {error && <div className="mt-2 text-danger">Error: {error.message}</div>}

      <nav.FormNavigation
        left={<nav.Previous />}
        right={<PublishAndSend publish={publish} />}
      />
    </div>
  )
})``

const PublishAndSend = ({ publish }: { publish: UsePublishTestimony }) => {
  if (publish.alreadyPublished) {
    return <ShareButtons />
  } else {
    return <PublishButton publish={publish} />
  }
}

const PublishButton = ({ publish }: { publish: UsePublishTestimony }) => {
  return (
    <LoadingButton
      disabled={!publish.synced}
      loading={publish.publish.loading}
      className="form-navigation-btn"
      variant="danger"
      onClick={publish.publish.execute}
    >
      Publish and Send
    </LoadingButton>
  )
}
