import type { ModalProps } from "react-bootstrap"
import { Button, Image, Col, Modal, Row, Stack } from "../bootstrap"
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
  const check = async () => {
    if (await recheck.execute()) onHide?.()
  }
  return (
    <Modal show={show} onHide={onHide} centered>
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
            <Internal href="/edit-profile" className="view-edit-profile">
              <Button onClick={onHide}>{t("setUpProfile")}</Button>
            </Internal>
          </Stack>
        </Col>
      </Modal.Body>
    </Modal>
  )
}
