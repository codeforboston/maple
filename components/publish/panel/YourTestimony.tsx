import styled from "styled-components"
import { Button } from "../../bootstrap"
import { ImageButton } from "../../buttons"
import { Internal, Wrap } from "../../links"
import { usePublishService, usePublishState } from "../redux"
import { TestimonyPreview } from "../TestimonyPreview"
import { formUrl } from "./hooks"

export const YourTestimony = styled(({ ...rest }) => {
  return (
    <div {...rest}>
      <MainPanel className="mb-3" />
      <TwitterButton className="m-2 mb-3" />
      <EmailButton className="m-2" />
    </div>
  )
})`
  display: flex;
  flex-direction: column;
`

const MainPanel = styled(({ ...rest }) => {
  const { draft, publication, deleteTestimony } = usePublishService() ?? {}
  const unpublishedDraft = draft?.publishedVersion === undefined

  return (
    <div {...rest}>
      <div className="d-flex">
        <span className="title">Your Testimony</span>
        <EditTestimonyButton className="me-1" />
        <HideTestimonyButton />
      </div>
      <div className="divider mt-3 mb-3" />
      <TestimonyPreview />
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
`

const EditTestimonyButton = (props: ClsProps) => {
  const billId = useBillId()
  return (
    <Internal href={formUrl(billId)}>
      <ImageButton {...props} alt="edit testimony" src="edit-testimony.svg" />
    </Internal>
  )
}

const HideTestimonyButton = (props: ClsProps) => {
  return <ImageButton alt="hide testimony" src="hide-testimony.svg" />
}

type ClsProps = { className?: string }

const Cta = styled(Button).attrs({ variant: "light" })`
  line-height: 2.5rem;
  border-radius: 0.5rem;
  padding: 0;
`

const TwitterButton = (props: ClsProps) => {
  return <Cta {...props}>Post to Twitter</Cta>
}

const EmailButton = (props: ClsProps) => {
  const billId = useBillId()
  return (
    <Wrap href={formUrl(billId, "share")}>
      <Cta {...props}>Send as Email</Cta>
    </Wrap>
  )
}

const useBillId = () => usePublishState().bill?.id!
