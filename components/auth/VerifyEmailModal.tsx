import type { ModalProps } from "react-bootstrap"
import { Alert, Button, Image, Col, Modal, Row, Stack } from "../bootstrap"
import { Internal } from "components/links"
import { useTranslation } from "next-i18next"
import { useRecheckEmailVerified } from "./hooks"

export default function VerifyEmailModal({
  show,
  onHide
}: Pick<ModalProps, "show" | "onHide">) {
  const { t } = useTranslation("auth")
  // For an email verified in another tab, which this one can't see by itself.
  const recheck = useRecheckEmailVerified()
  // A failed check shows its error below; the button is there to try again.
  const check = () =>
    recheck.execute().then(
      verified => verified && onHide?.(),
      () => {}
    )
  return (
    <Modal show={show} onHide={onHide} onExited={recheck.reset} centered>
      <Modal.Header closeButton>
        <Modal.Title id="tos-modal">{t("signUp")}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Col md={11} className="mx-auto">
          <Stack gap={3} direction="vertical" className="mb-4 text-center">
            <Image fluid height={`18em`} src="/mailbox.svg" alt="" />
            <h2 className={`fw-bold`}>{t("verifyEmail")}</h2>
            <h6>{t("verifyLinkSent")}</h6>
            <Button
              variant="outline-secondary"
              className="align-self-center"
              onClick={check}
              disabled={recheck.loading}
            >
              {t("verifiedCheck")}
            </Button>
            {recheck.status === "success" && !recheck.result && (
              <p className="mb-0">{t("verifiedNotYet")}</p>
            )}
            {recheck.error && (
              <Alert variant="danger" className="mb-0">
                {recheck.error.message}
              </Alert>
            )}
            <Internal href="/edit-profile" className="view-edit-profile">
              <Button onClick={onHide}>{t("setUpProfile")}</Button>
            </Internal>
          </Stack>
        </Col>
      </Modal.Body>
    </Modal>
  )
}
