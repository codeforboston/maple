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
import { useTranslation } from "next-i18next"

/** Allow sharing a user's published testimony. */
export const ShareTestimony = styled(({ ...rest }) => {
  useFormRedirection()
  const { t } = useTranslation("testimony")
  return (
    <div {...rest}>
      <StepHeader>{t("publish.shareHeader")}</StepHeader>
      <SelectRecipients className="mt-4" />
      <YourTestimony type="published" className="mt-4" />
      <nav.FormNavigation right={<ShareButtons />} />
    </div>
  )
})``

const EmailHelp = (props: { className?: string }) => {
  const { t } = useTranslation("testimony")
  return (
    <External
      href="https://www.makeuseof.com/tag/how-to-change-the-default-email-program-for-mailto-links/"
      {...props}
    >
      {t("publish.emailHelp")}
    </External>
  )
}

export const ShareButtons = ({
  initialSent = false
}: {
  initialSent?: boolean
}) => {
  const { t } = useTranslation("testimony")
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
        {t("publish.finishedBackToBill")}
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
  const { t } = useTranslation("testimony")
  const [show, setShow] = useState(false)
  const onHide = () => setShow(false)
  return (
    <>
      <Button
        variant="outline-secondary"
        className="form-navigation-btn"
        onClick={() => setShow(true)}
      >
        {t("publish.finishWithoutEmailing")}
      </Button>
      <Modal
        show={show}
        onHide={onHide}
        aria-labelledby="sign-in-modal"
        centered
      >
        <Modal.Header>
          <Modal.Title id="sign-in-modal">
            {t("publish.finishWithoutEmailingQuestion")}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>{t("publish.finishWithoutEmailingBody")}</p>
        </Modal.Body>
        <Modal.Footer className="p-2">
          <Button variant="outline-danger" onClick={onConfirm}>
            {t("publish.finishWithoutEmailingConfirm")}
          </Button>
          <Button variant="secondary" onClick={onHide}>
            {t("publish.continueSharing")}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}
