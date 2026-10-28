import { useCallback, useEffect, useState } from "react"
import styled from "styled-components"
import { Attachment } from "../CommentModal/Attachment"
import { useAuth } from "../auth"
import { useDraftTestimonyAttachment } from "../db"
import { Maybe } from "../db/common"
import { TextArea } from "../forms/Input"
import { useAppDispatch } from "../hooks"
import * as links from "../links"
import * as nav from "./NavigationButtons"
import { SelectRecipients } from "./SelectRecipients"
import { SectionHead } from "./SectionHead"
import { StepHeader } from "./StepHeader"
import { useFormRedirection, usePublishCopy, usePublishState } from "./hooks"
import { setAttachmentId, setContent } from "./redux"
import { Trans, useTranslation } from "next-i18next"
type TabKey = "text" | "import"
type UseWriteTestimony = ReturnType<typeof useWriteTestimony>

function useWriteTestimony() {
  const dispatch = useAppDispatch()
  const { attachmentId, content, sync, errors, position } = usePublishState()
  const uid = useAuth().user?.uid!
  const attachment = useDraftTestimonyAttachment(uid, attachmentId, id =>
    dispatch(setAttachmentId(id))
  )

  useFormRedirection()

  return {
    setContent: (c: Maybe<string>) => dispatch(setContent(c)),
    content,
    attachment,
    attachmentId,
    sync,
    error: errors.content
  }
}

export const WriteTestimony = styled(props => {
  const { t, copy, isBallotQuestion } = usePublishCopy()
  const write = useWriteTestimony()
  // const tabs = useTabs(write)

  const valid = !!write.content
  const testimonyLabel = copy(
    "submitTestimonyForm.write.testimonyLabel",
    "ballotQuestion.submitTestimonyForm.write.testimonyLabel"
  )

  return (
    <div {...props}>
      <StepHeader>
        {copy(
          "submitTestimonyForm.write.header",
          "ballotQuestion.submitTestimonyForm.write.header"
        )}
      </StepHeader>
      {!isBallotQuestion && <SelectRecipients className="my-4" />}
      {/* The testimony under a title row of its own, as the recipients above
          it are (SelectRecipients.tsx). */}
      <section className="mb-4 titled">
        <SectionHead>
          <h3>{testimonyLabel}</h3>
        </SectionHead>
        <TextArea
          setContent={write.setContent}
          content={write.content}
          error={write.error}
          label={testimonyLabel}
          placeholder={copy(
            "submitTestimonyForm.write.testimonyPlaceholder",
            "ballotQuestion.submitTestimonyForm.write.testimonyPlaceholder"
          )}
          help={copy(
            "submitTestimonyForm.write.testimonyHelp",
            "ballotQuestion.submitTestimonyForm.write.testimonyHelp"
          )}
          className="text-container"
        />
        <div>
          <Trans
            t={t}
            i18nKey={
              isBallotQuestion
                ? "ballotQuestion.submitTestimonyForm.write.tips"
                : "submitTestimonyForm.write.tips"
            }
            components={[
              // eslint-disable-next-line react/jsx-key
              <links.Internal href="/writing-effective-testimony" />
            ]}
          />
        </div>

        <div>
          <links.Internal href="/policies/code-of-conduct">
            {t("submitTestimonyForm.write.codeOfConduct")}
          </links.Internal>
        </div>

        <Attachment
          className="mt-3"
          attachment={write.attachment}
          confirmRemove={true}
          label={copy(
            "submitTestimonyForm.write.attachmentLabel",
            "ballotQuestion.submitTestimonyForm.write.attachmentLabel"
          )}
        />
      </section>
      <nav.FormNavigation
        left={<nav.Previous />}
        right={<nav.Next disabled={!valid} />}
        status
      />
    </div>
  )
})`
  display: flex;
  flex-direction: column;

  .text-container label {
    font-size: 1.5rem;
  }

  /* Under its section's title the title names the box, so its own label is
     kept for screen readers only. */
  .titled .text-container > .form-label {
    position: absolute;
    width: 1px;
    height: 1px;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
  }

  /* The testimony box's edge darker than the site's faint field border, so the
     space to write in is plain to see. Focused, it keeps Bootstrap's focus
     border. */
  [data-maple-theme="dd"] & .text-container .form-control:not(:focus) {
    border-color: rgba(15, 23, 42, 0.3);
  }
`

const useTabs = ({
  sync: syncState,
  attachmentId,
  attachment: { remove: removeAttachment }
}: UseWriteTestimony) => {
  const { t } = useTranslation("testimony")
  const [activeKey, setActiveKey] = useState<TabKey | undefined>()

  useEffect(() => {
    if (syncState === "synced" && activeKey === undefined) {
      setActiveKey(attachmentId ? "import" : "text")
    }
  }, [syncState, activeKey, attachmentId])

  const onSelect = useCallback(
    (k: string | null) => {
      const key: TabKey | null = k as TabKey
      if (key === "text" && attachmentId) {
        if (confirm(t("submitTestimonyForm.write.confirmRemoveAttachment")))
          removeAttachment().then(() => setActiveKey(key))
      } else if (key !== null) {
        setActiveKey(key)
      }
    },
    [attachmentId, removeAttachment, t]
  )

  return { onSelect, activeKey, loading: activeKey === undefined }
}

const AttachmentInput = (write: UseWriteTestimony) => {
  return (
    <div>
      {/* <Text
        {...write}
        inputProps={{
          label: "Description",
          placeholder: "Add a brief description of your testimony here",
          rows: 3,
          help: undefined
        }}
      /> */}
    </div>
  )
}
