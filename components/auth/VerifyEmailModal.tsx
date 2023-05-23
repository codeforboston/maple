import type { ModalProps } from "react-bootstrap"
import { Button, Image, Col, Modal, Row, Stack } from "../bootstrap"
import styles from "./VerifyEmailModal.module.css"
import { Internal } from "components/links"
import { useTranslation } from "next-i18next"

export default function VerifyEmailModal({
  show,
  onHide
}: Pick<ModalProps, "show" | "onHide">) {
  const { t } = useTranslation("auth")
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton className={styles.modalHeader}>
        <Modal.Title id="tos-modal">{t("signUp")}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Col md={11} className="mx-auto">
          <Stack gap={3} direction="vertical" className="mb-4 text-center">
            <Image
              fluid
              className={styles.image}
              src="/mailbox.svg"
              alt={t("mailboxImgAlt") ?? "Mail entering mailbox"}
            />
            <h2 className={styles.title}>{t("verifyEmail")}</h2>
            <h6 className={styles.body}>{t("verifyLinkSent")}</h6>
            <Internal href="/editprofile" className="view-edit-profile">
              <Button onClick={onHide}>{t("setUpProfile")}</Button>
            </Internal>
          </Stack>
        </Col>
      </Modal.Body>
    </Modal>
  )
}
