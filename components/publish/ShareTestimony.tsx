import clsx from "clsx"
import { External, maple } from "components/links"
import { useRouter } from "next/router"
import { useCallback, useState } from "react"
import styled from "styled-components"
import { Button, Modal } from "../bootstrap"
import { useAppDispatch } from "../hooks"
import { useFormRedirection, usePublishState, useTestimonyEmail } from "./hooks"
import * as nav from "./NavigationButtons"
import { setShowThankYou } from "./redux"
import { SelectRecipients } from "./SelectRecipients"
import { SendEmailButton } from "./SendEmailButton"
import { StepHeader } from "./StepHeader"
import { YourTestimony } from "./TestimonyPreview"

/** Allow sharing a user's published testimony. */
export const ShareTestimony = styled(({ ...rest }) => {
  useFormRedirection()
  return (
    <div {...rest}>
      <StepHeader>Share</StepHeader>
      <SelectRecipients className="mt-4" />
      <YourTestimony type="published" className="mt-4" />
      <nav.FormNavigation right={<ShareButtons />} />
    </div>
  )
})``

const EmailHelp = (props: { className?: string }) => {
  return (
    <External
      href="https://www.makeuseof.com/tag/how-to-change-the-default-email-program-for-mailto-links/"
      {...props}
    >
      Having trouble opening the email draft?
    </External>
  )
}

export const ShareButtons = ({
  initialSent = false
}: {
  initialSent?: boolean
}) => {
  const { share, bill } = usePublishState()
  const router = useRouter()
  const dispatch = useAppDispatch()
  const redirectToBill = useCallback(() => {
    dispatch(setShowThankYou(true))
    router.push(maple.bill(bill!))
  }, [bill, dispatch, router])
  const [sent, setSent] = useState(initialSent)

  const buttons = []

  if (share.recipients.length > 0) {
    buttons.push(
      <SendEmailButton
        key="send-email"
        className="form-navigation-btn"
        onClick={() => setSent(true)}
      />
    )
  } else if (!share.loading && !sent) {
    buttons.push(
      <FinishWithoutEmailing
        key="finish-without-saving"
        onConfirm={redirectToBill}
      />
    )
  }

  if (sent) {
    buttons.push(
      <Button
        variant="success"
        className="form-navigation-btn text-white"
        onClick={redirectToBill}
      >
        Finished! Back to Bill
      </Button>
    )
  }

  return (
    <div className="d-flex flex-column align-items-end">
      {sent && <EmailHelp className="mb-2 text-info" />}
      <div className="d-flex flex-column gap-2 flex-wrap">{buttons}</div>
    </div>
  )
}

export function FinishWithoutEmailing({
  onConfirm
}: {
  onConfirm: () => void
}) {
  const [show, setShow] = useState(false)
  const onHide = () => setShow(false)
  return (
    <>
      <Button
        variant="outline-secondary"
        className="form-navigation-btn"
        onClick={() => setShow(true)}
      >
        Finish Without Emailing
      </Button>
      <Modal
        show={show}
        onHide={onHide}
        aria-labelledby="sign-in-modal"
        centered
      >
        <Modal.Header>
          <Modal.Title id="sign-in-modal">Finish Without Emailing?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Are you sure you want to finish without emailing your testimony?
            Engaging with your legislators helps them help you.
          </p>
        </Modal.Body>
        <Modal.Footer className="p-2">
          <Button variant="outline-danger" onClick={onConfirm}>
            Yes, Finish Without Emailing
          </Button>
          <Button variant="secondary" onClick={onHide}>
            Continue Sharing
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}
