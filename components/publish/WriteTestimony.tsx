import { useCallback, useEffect, useState } from "react"
import styled from "styled-components"
import { useAuth } from "../auth"
import { Form, Tab, Tabs } from "../bootstrap"
import { Attachment } from "../CommentModal/Attachment"
import { useDraftTestimonyAttachment } from "../db"
import { Maybe } from "../db/common"
import { useAppDispatch } from "../hooks"
import { Loading } from "../legislatorSearch"
import { setAttachmentId, setContent, usePublishState } from "./redux"
import { StepHeader } from "./StepHeader"
import { SyncStatus } from "./SyncStatus"

type TabKey = "text" | "import"

export const WriteTestimony = styled(({ ...rest }) => {
  const write = useWriteTestimony()
  const tabs = useTabs(write)
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
          <SyncStatus />
        </>
      )}
    </div>
  )
})``

type UseWriteTestimony = ReturnType<typeof useWriteTestimony>
function useWriteTestimony() {
  const dispatch = useAppDispatch()
  const { attachmentId, content, sync } = usePublishState()
  const uid = useAuth().user?.uid!
  const attachment = useDraftTestimonyAttachment(uid, attachmentId, id =>
    dispatch(setAttachmentId(id))
  )

  return {
    setContent: (c: Maybe<string>) => dispatch(setContent(c)),
    content,
    attachment,
    attachmentId,
    sync
  }
}

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

const Import = ({ content, setContent, attachment }: UseWriteTestimony) => {
  return (
    <div>
      <Form.Group className="mt-3" controlId="testimonyTextContent">
        <Form.Label>Description</Form.Label>
        <Form.Control
          as="textarea"
          placeholder="Add a brief description of your testimony here"
          rows={3}
          value={content}
          onChange={e => setContent(e.target.value)}
        />
      </Form.Group>
      <Attachment className="mt-3" attachment={attachment} />
    </div>
  )
}

const Text = ({ content, setContent }: UseWriteTestimony) => {
  return (
    <Form.Group className="mt-3" controlId="testimonyTextContent">
      <Form.Label>Testimony Text</Form.Label>
      <Form.Control
        as="textarea"
        placeholder="Add your testimony here"
        rows={6}
        value={content}
        onChange={e => setContent(e.target.value)}
      />
      <Form.Text muted>Testimony is limited to 10,000 characters.</Form.Text>
    </Form.Group>
  )
}
