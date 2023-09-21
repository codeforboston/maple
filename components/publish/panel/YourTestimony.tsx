import { hasDraftChanged } from "components/db"
import { useState } from "react"
import styled from "styled-components"
import { Button, Stack } from "../../bootstrap"
import { External, twitterShareLink, Wrap } from "../../links"
import { formUrl, usePublishService, usePublishState } from "../hooks"
import { TestimonyPreview } from "../TestimonyPreview"
import { EditTestimonyButton } from "./EditTestimonyButton"
import { ArchiveTestimonyButton } from "./ArchiveTestimonyButton"
import { ArchiveTestimonyConfirmation } from "./ArchiveTestimonyConfirmation"

export const YourTestimony = () => {
  const synced = usePublishState().sync === "synced"
  return synced ? (
    <Stack gap={4}>
      <MainPanel />
      <TwitterButton className="mx-2" />
      <EmailButton className="mx-2" />
    </Stack>
  ) : null
}

const MainPanel = styled(({ ...rest }) => {
  const { draft, deleteTestimony, publication } = usePublishService() ?? {}
  const unpublishedDraft = hasDraftChanged(draft, publication)
  const [showConfirm, setShowConfirm] = useState(false)
  const bill = usePublishState().bill!

  return (
    <div {...rest}>
      <div className="d-flex">
        <span className="title">Your Testimony</span>
        <EditTestimonyButton
          className="me-1"
          billId={bill.id}
          court={bill.court}
        />
        {/*Delete testimony removed until ready */}
        {/* <ArchiveTestimonyButton onClick={() => setShowConfirm(s => !s)} /> */}
      </div>
      {/*Delete testimony confirmation-dropdown removed until ready */}
      {/* <ArchiveTestimonyConfirmation
        className="mt-2"
        show={showConfirm}
        onHide={() => setShowConfirm(false)}
        archiveTestimony={deleteTestimony}
      /> */}
      <div className="divider mt-3 mb-3" />
      <TestimonyPreview type="draft" className="mb-2" />
      {unpublishedDraft && <div className="draft-badge">Draft</div>}
    </div>
  )
})`
  --previewPadding: 1rem;
  background-color: white;
  border-radius: 1rem;
  padding: var(--previewPadding);
  .divider {
    height: 1px;
    background-color: var(--bs-gray-500);
  }
  .draft-badge {
    background-color: var(--bs-orange);
    text-align: center;
    margin: calc(-1 * var(--previewPadding));
    margin-top: 0;
    overflow: hidden;
    color: white;
    font-weight: bold;
    border-radius: 0 0 4px 4px;
    line-height: 2.5rem;
  }
  .title {
    flex-grow: 1;
    font-size: 1.25rem;
    font-weight: bold;
  }
  .endorse-position {
    color: var(--bs-green);
  }
  .oppose-position {
    color: var(--bs-orange);
  }
  .neutral-position {
    color: var(--bs-blue);
  }
  .position-section {
    text-align: center;
  }
  .testimony-button {
    width: 2rem;
    height: 2rem;
  }
`

type ClsProps = { className?: string }

const Cta = styled(Button).attrs({ variant: "light" })`
  min-height: 3rem;
  border-radius: 0.5rem;
  padding: 0.5rem;
  display: inline-flex;
  gap: 5px;
  flex-direction: row;
  justify-content: center;
  align-items: center;
`

const TwitterButton = (props: ClsProps) => {
  const { publication } = usePublishState()
  return publication ? (
    <External as={Cta} href={twitterShareLink(publication)} {...props}>
      Tweet Your Published Testimony
    </External>
  ) : null
}

const EmailButton = (props: ClsProps) => {
  const { publication, bill: { id: billId, court } = {} } = usePublishState()
  return publication ? (
    <Wrap href={formUrl(billId!, court!, "share")}>
      <Cta {...props}>Email Your Published Testimony </Cta>
    </Wrap>
  ) : null
}
