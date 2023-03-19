import clsx from "clsx"
import { useCallback, useEffect, useState } from "react"
import styled from "styled-components"
import { useAuth } from "../auth"
import { Tab, Tabs } from "../bootstrap"
import { Attachment } from "../CommentModal/Attachment"
import { useDraftTestimonyAttachment } from "../db"
import { Maybe } from "../db/common"
import Input, { InputProps } from "../forms/Input"
import { useAppDispatch } from "../hooks"
import { Loading } from "../legislatorSearch"
import { useFormRedirection, usePublishState } from "./hooks"
import * as nav from "./NavigationButtons"
import { setAttachmentId, setContent } from "./redux"
import { SelectRecipients } from "./SelectRecipients"
import { StepHeader } from "./StepHeader"
import * as links from "../links"
import { TextArea } from "../forms/Input"
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
  const write = useWriteTestimony()
  // const tabs = useTabs(write)

  const valid = !!write.content

  return (
    <div {...props}>
      <StepHeader step={2}>Write Your Testimony</StepHeader>
      <SelectRecipients className="my-4" />

      <div className="divider" />

      <div className="mt-4">
        <TextArea
          {...write}
          label="Testimony"
          placeholder="Add your testimony here"
          help="Testimony is limited to 10,000 characters."
          className="text-container"
        />
        <div>
          Need help? Read our{" "}
          <links.Internal href="/learn/writing-effective-testimony">
            testimony writing tips
          </links.Internal>
        </div>

        <div>
          <links.Internal href="/policies/code-of-conduct">
            View our code of conduct
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
        if (confirm("Are you sure you want to remove your attachment?"))
          removeAttachment().then(() => setActiveKey(key))
      } else if (key !== null) {
        setActiveKey(key)
      }
    },
    [attachmentId, removeAttachment]
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
