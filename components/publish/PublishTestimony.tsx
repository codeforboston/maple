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
  usePublishState,
  useTestimonyEmail
} from "./hooks"
import * as nav from "./NavigationButtons"
import { setEditReason } from "./redux"
import { SelectRecipients } from "./SelectRecipients"
import { ShareButtons } from "./ShareTestimony"
import { StepHeader } from "./StepHeader"
import { YourTestimony } from "./TestimonyPreview"
import { hasDraftChanged } from "components/db"
import { useTranslation, Trans } from "next-i18next"

const INITIAL_VERSION = 1,
  MAX_EDITS = 5,
  MAX_VERSION = INITIAL_VERSION + MAX_EDITS

type UsePublishTestimony = ReturnType<typeof usePublishTestimony>
function usePublishTestimony() {
  const dispatch = useAppDispatch()
  const { sync, draft, publication, editReason, errors, share } =
    usePublishState()
  const publish = useAsyncCallback(async () => {
    const result = await dispatch(publishTestimonyAndProceed())
    // pass error through to useAsync
    if (isRejected(result)) throw result.error
  })
  const publishedAndDraftChanged =
      publication && hasDraftChanged(draft, publication),
    canShare = publication && !publishedAndDraftChanged,
    synced = sync === "synced" || sync === "error",
    hasRecipients = !isEmpty(share.recipients)

  useFormRedirection()

  return {
    synced,
    publishedAndDraftChanged,
    publish,
    canShare,
    editReason,
    hasRecipients,
    errors,
    valid: Object.values(errors).every(v => !v),
    setEditReason: (reason: string) => dispatch(setEditReason(reason))
  }
}

export const PublishTestimony = styled(({ ...rest }) => {
  const { t } = useTranslation("testimony")
  const publish = usePublishTestimony(),
    error = publish.publish.error

  return (
    <div {...rest}>
      <StepHeader step={3}>{t("publish.confirmAndSend")}</StepHeader>
      <SelectRecipients className="mt-4" />
      <YourTestimony type="draft" className="mt-4" />

      <EditReason className="mt-4" />

      {error && (
        <div className="mt-2 text-danger">
          {t("publish.errorMessage", { message: error.message })}
        </div>
      )}

      <nav.FormNavigation
        status
        left={<nav.Previous />}
        right={<PublishAndSend publish={publish} />}
      />
      <p>{t("publish.instructions")}</p>
    </div>
  )
})``

/** An orange notice with rounded corners that lists the testimony fields that the user has edited. */
const ChangeNotice = styled(props => {
  const { position, content, attachmentId, publication } = usePublishState()
  const { t } = useTranslation("testimony")
  if (!publication) return null

  const publishedAttachmentId = publication.draftAttachmentId || undefined

  const changes = [
    position !== publication.position && t("publish.change.position"),
    content !== publication.content && t("publish.change.content"),
    attachmentId !== publishedAttachmentId && t("publish.change.attachment")
  ]
    .filter(Boolean)
    .map((s, i) => (
      <span key={i} className="change">
        {s} {t("publish.change.changed")}
      </span>
    ))

  const editsRemaining = Math.max(0, 6 - publication.version)

  return (
    <div {...props}>
      <div className="changes">{changes}</div>
      <p>
        <b>
          <Trans
            t={t}
            i18nKey="publish.editLimitNotice"
            values={{ count: editsRemaining }}
          />
        </b>
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
  const { publishedAndDraftChanged, editReason, setEditReason, errors } =
    usePublishTestimony()
  const { t } = useTranslation("testimony")
  if (!publishedAndDraftChanged) return null

  return (
    <div {...props}>
      <TextArea
        content={editReason}
        setContent={setEditReason}
        rows={3}
        label={t("publish.reasonLabel")}
        placeholder={t("publish.reasonPlaceholder")}
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
  if (publish.canShare) {
    return <ShareButtons initialSent />
  } else {
    return <PublishButton publish={publish} />
  }
}

const PublishButton = ({ publish }: { publish: UsePublishTestimony }) => {
  const { ready, mailToUrl } = useTestimonyEmail()
  const { t } = useTranslation("testimony")

  if (!ready) return null
  return (
    <LoadingButton
      disabled={!publish.synced || !publish.valid}
      loading={publish.publish.loading}
      className="form-navigation-btn"
      variant="danger"
      onClick={() => {
        if (publish.hasRecipients)
          window.open(mailToUrl, "_blank", "noopener,noreferrer")
        void publish.publish.execute()
      }}
    >
      {publish.hasRecipients ? t("publish.publishAndSend") : t("publish")}
    </LoadingButton>
  )
}
