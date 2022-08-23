import clsx from "clsx"
import { useState } from "react"
import { UseAsyncReturn } from "react-async-hook"
import { Collapse, ImageProps } from "react-bootstrap"
import styled from "styled-components"
import { Button, Spinner, Stack } from "../../bootstrap"
import { ImageButton } from "../../buttons"
import { External, twitterShareLink, Wrap } from "../../links"
import { formUrl, usePublishService, usePublishState } from "../hooks"
import { TestimonyPreview } from "../TestimonyPreview"

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
  const { draft, deleteTestimony } = usePublishService() ?? {}
  const unpublishedDraft = draft?.publishedVersion === undefined

  const [showConfirm, setShowConfirm] = useState(false)
  return (
    <div {...rest}>
      <div className="d-flex">
        <span className="title">Your Testimony</span>
        <EditTestimonyButton className="me-1" />
        <DeleteTestimonyButton onClick={() => setShowConfirm(s => !s)} />
      </div>
      <DeleteTestimonyConfirmation
        className="mt-2"
        show={showConfirm}
        onHide={() => setShowConfirm(false)}
        deleteTestimony={deleteTestimony}
      />
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

  .testimony-button {
    width: 2rem;
    height: 2rem;
  }
`

const EditTestimonyButton = ({ className }: ClsProps) => {
  const billId = usePublishState().bill?.id!,
    url = formUrl(billId)
  return (
    <ImageButton
      alt="edit testimony"
      tooltip="Edit Testimony"
      src="edit-testimony.svg"
      href={url}
      className={clsx("testimony-button", className)}
    />
  )
}

const DeleteTestimonyButton = (props: ImageProps) => {
  return (
    <ImageButton
      alt="delete testimony"
      tooltip="Delete Testimony"
      src="delete-testimony.svg"
      className="testimony-button"
      {...props}
    />
  )
}

const DeleteTestimonyConfirmation = styled<{
  show: boolean
  onHide: () => void
  deleteTestimony: UseAsyncReturn<void, []> | undefined
}>(({ show, onHide, deleteTestimony, ...props }) => {
  return (
    <Collapse in={show}>
      <div>
        <div {...props}>
          <div>Are you sure you want to delete your testimony?</div>
          <div className="d-flex justify-content-center mt-2">
            <Button
              className="choice me-4"
              variant="success"
              onClick={deleteTestimony?.execute}
              disabled={
                deleteTestimony === undefined || deleteTestimony.loading
              }
            >
              {deleteTestimony?.loading ? (
                <Spinner size="sm" animation="border" />
              ) : (
                "Yes"
              )}
            </Button>
            <Button className="choice" variant="info" onClick={onHide}>
              No
            </Button>
          </div>
        </div>
      </div>
    </Collapse>
  )
})`
  font-size: 0.75rem;
  .choice {
    font-size: inherit;
    padding: 0.2rem 0.5rem 0.2rem 0.5rem;
    border-radius: 0.75rem;
    color: white;
    display: flex;
    align-items: center;
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
  const { publication, bill: { id: billId } = {} } = usePublishState()
  return publication ? (
    <Wrap href={formUrl(billId!, "share")}>
      <Cta {...props}>Email Your Published Testimony </Cta>
    </Wrap>
  ) : null
}
