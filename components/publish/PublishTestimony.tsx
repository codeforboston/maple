import { isRejected } from "@reduxjs/toolkit"
import { isEmpty } from "lodash"
import Input, { TextArea } from "components/forms/Input"
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
import { setEditReason } from "./redux"
import { SelectRecipients } from "./SelectRecipients"
import { ShareButtons } from "./ShareTestimony"
import { StepHeader } from "./StepHeader"
import { YourTestimony } from "./TestimonyPreview"

const INITIAL_VERSION = 1,
  MAX_EDITS = 5,
  MAX_VERSION = INITIAL_VERSION + MAX_EDITS

type UsePublishTestimony = ReturnType<typeof usePublishTestimony>
function usePublishTestimony() {
  const dispatch = useAppDispatch()
  const { sync, draft, publication, editReason, errors } = usePublishState()
  const publish = useAsyncCallback(async () => {
    const result = await dispatch(publishTestimonyAndProceed())
    // pass error through to useAsync
    if (isRejected(result)) throw result.error
  })
  const alreadyPublished = Boolean(
      draft?.publishedVersion !== undefined && publication
    ),
    isEdit = Boolean(draft?.publishedVersion === undefined && publication),
    synced = sync === "synced" || sync === "error"

  useFormRedirection()

  console.log(isEmpty(errors), errors)
  return {
    synced,
    alreadyPublished,
    publish,
    isEdit,
    editReason,
    errors,
    valid: Object.values(errors).every(v => !v),
    setEditReason: (reason: string) => dispatch(setEditReason(reason))
  }
}

export const PublishTestimony = styled(({ ...rest }) => {
  const publish = usePublishTestimony(),
    error = publish.publish.error

  return (
    <div {...rest}>
      <StepHeader>Confirm and Send</StepHeader>
      <SelectRecipients className="mt-4" />
      <YourTestimony className="mt-4" />

      <EditReason className="mt-4" />

      {error && <div className="mt-2 text-danger">Error: {error.message}</div>}

      <nav.FormNavigation
        status
        left={<nav.Previous />}
        right={<PublishAndSend publish={publish} />}
      />
    </div>
  )
})``

/** An orange notice with rounded corners that lists the testimony fields that the user has edited. */
const ChangeNotice = styled(props => {
  const { position, content, attachmentId, publication } = usePublishState()
  if (!publication) return null

  const changes = [
    position !== publication.position && "Position",
    content !== publication.content && "Content",
    attachmentId !== publication.draftAttachmentId && "Attachment"
  ]
    .filter(Boolean)
    .map((s, i) => (
      <span key={i} className="change">
        {s} Changed
      </span>
    ))

  const editsRemaining = 6 - publication.version

  return (
    <div {...props}>
      <div className="changes">{changes}</div>
      <p>
        <b>You may edit your testimony up to {editsRemaining} more times.</b>{" "}
        Before you publish updates to your testimony, please provide a reason
        for your changes.
      </p>
    </div>
  )
})`
  .change {
    background-color: var(--bs-orange);
    border-radius: 1rem;
    font-weight: bold;
    color: white;
    padding: 0.2rem 0.5rem;
  }

  .changes {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }
`

export const EditReason = styled(props => {
  const { isEdit, editReason, setEditReason, errors } = usePublishTestimony()
  if (!isEdit) return null

  return (
    <div {...props}>
      <TextArea
        content={editReason}
        setContent={setEditReason}
        rows={3}
        label="Reason for Edit"
        placeholder="Describe the reason for your edit here"
        error={errors.editReason}
      >
        <ChangeNotice />
      </TextArea>
    </div>
  )
})`
  & label {
    font-size: 1.5rem;
  }
`

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
      disabled={!publish.synced || !publish.valid}
      loading={publish.publish.loading}
      className="form-navigation-btn"
      variant="danger"
      onClick={publish.publish.execute}
    >
      Publish and Send
    </LoadingButton>
  )
}
