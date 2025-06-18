import { useCallback, useEffect, useState } from "react"
import styled from "styled-components"
import { Attachment } from "../CommentModal/Attachment"
import { useAuth } from "../auth"
import { useDraftTestimonyAttachment } from "../db"
import { TextArea } from "../forms/Input"
import { useAppDispatch } from "../hooks"
import * as links from "../links"
import * as nav from "./NavigationButtons"
import { SelectRecipients } from "./SelectRecipients"
import { StepHeader } from "./StepHeader"
import { useFormRedirection, usePublishState } from "./hooks"
import { setAttachmentId, setContent } from "./redux"
import { Trans, useTranslation } from "react-i18next"
import { Maybe } from "common"
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
  const { t } = useTranslation("testimony")
  const write = useWriteTestimony()
  // const tabs = useTabs(write)

  const valid = !!write.content

  return (
    <div {...props}>
      <StepHeader step={2}>{t("submitTestimonyForm.write.header")}</StepHeader>
      <SelectRecipients className="my-4" />

      <div className="divider" />

      <div className="mt-4">
        <TextArea
          setContent={write.setContent}
          content={write.content}
          error={write.error}
          label={t("submitTestimonyForm.write.testimonyLabel")}
          placeholder={t("submitTestimonyForm.write.testimonyPlaceholder")}
          help={t("submitTestimonyForm.write.testimonyHelp")}
          className="text-container"
        />
        <div>
          <Trans
            t={t}
            i18nKey="submitTestimonyForm.write.tips"
            components={[
              // eslint-disable-next-line react/jsx-key
              <links.Internal href="/learn/writing-effective-testimony" />
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
        />
      </div>

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

  .divider {
    height: 1px;
    flex: auto;
    background: var(--bs-gray-500);
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
