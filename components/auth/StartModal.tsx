import type { ModalProps } from "react-bootstrap"
import { Button, Col, Image, Modal, Stack } from "../bootstrap"
import { useTranslation } from "next-i18next"

export default function StartModal({
  show,
  onHide,
  onSignInClick,
  onSignUpClick,
  isFromProtectedPage = false
}: Pick<ModalProps, "show" | "onHide"> & {
  onSignInClick: () => void
  onSignUpClick: () => void
  isFromProtectedPage?: boolean
}) {
  const { t } = useTranslation("auth")

  return (
    <Modal show={show} onHide={onHide} aria-labelledby="start-modal" centered>
      <Modal.Header closeButton className={`py-4`}>
        <Modal.Title id="start-modal" className="visually-hidden">
          {isFromProtectedPage ? t("loginForProtectedAccess") : t("signUpOrIn")}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Col md={7} className="mx-auto">
          <Stack gap={3} direction="vertical" className="mb-4 text-center">
            <Image fluid src="/gov-with-mics.svg" alt="" />

            <p className="h5">
              {isFromProtectedPage
                ? t("loginForProtectedAccess")
                : t("addVoice")}
            </p>
            {isFromProtectedPage && (
              <p className="text-muted">{t("loginRequiredForAccess")}</p>
            )}
          </Stack>

          <Stack gap={3}>
            <Button onClick={onSignUpClick}>{t("signUp")}</Button>
            <Button variant="outline-primary" onClick={onSignInClick}>
              {t("signIn")}
            </Button>
          </Stack>
        </Col>
      </Modal.Body>
    </Modal>
  )
}
