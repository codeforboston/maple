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
import { StepHeader } from "./StepHeader"

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
    errors
  }
}

export const WriteTestimony = styled(({ ...rest }) => {
  const write = useWriteTestimony()
  const tabs = useTabs(write)

  let valid: boolean = false
  if (tabs.activeKey === "text") {
    valid = !!write.content && !write.attachmentId
  } else if (tabs.activeKey === "import") {
    valid = !!write.content && !!write.attachmentId
  }

  return (
    <div {...rest}>
      <StepHeader step={2}>Write Your Testimony</StepHeader>
      {tabs.loading ? (
        <Loading />
      ) : (
        <>
          <Tabs
            activeKey={tabs.activeKey}
            onSelect={tabs.onSelect}
            id="write-testimony"
            className="mt-4"
          >
            <Tab eventKey="text" title="Text">
              <Text {...write} />
            </Tab>
            <Tab eventKey="import" title="Import">
              <Import {...write} />
            </Tab>
          </Tabs>

          <nav.FormNavigation
            left={<nav.Previous />}
            right={<nav.Next disabled={!valid} />}
            status
          />
        </>
      )}
    </div>
  )
})``

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

const Import = (write: UseWriteTestimony) => {
  return (
    <div>
      <Text
        {...write}
        inputProps={{
          label: "Description",
          placeholder: "Add a brief description of your testimony here",
          rows: 3,
          help: undefined
        }}
      />
      <Attachment className="mt-3" attachment={write.attachment} />
    </div>
  )
}

const Text = ({
  content,
  setContent,
  errors,
  inputProps
}: UseWriteTestimony & { inputProps?: InputProps }) => {
  const [touched, setTouched] = useState(false)
  return (
    <Input
      className="mt-3"
      label="Testimony Text"
      placeholder="Add your testimony here"
      as="textarea"
      floating={false}
      rows={6}
      value={content}
      help="Testimony is limited to 10,000 characters."
      onChange={e => {
        setTouched(true)
        setContent(e.target.value)
      }}
      onBlur={() => setTouched(true)}
      error={touched ? errors.content : undefined}
      {...inputProps}
    />
  )
}
