import type { CSSProperties } from "react"
import type { ModalProps } from "react-bootstrap"
import { Button, Col, Image, Modal, Stack } from "../bootstrap"
import { useTranslation } from "next-i18next"

export default function StartModal({
  show,
  onHide,
  onSignInClick,
  onSignUpClick
}: Pick<ModalProps, "show" | "onHide"> & {
  onSignInClick: () => void
  onSignUpClick: () => void
}) {
  const { t } = useTranslation("auth")

  return (
    <Modal show={show} onHide={onHide} aria-labelledby="start-modal" centered>
      <Modal.Header closeButton className={`py-4`}>
        <Modal.Title id="start-modal" className="visually-hidden">
          {t("signUpOrIn")}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Col md={7} className="mx-auto">
          <Stack gap={3} direction="vertical" className="mb-4 text-center">
            <Image fluid src="/gov-with-mics.svg" alt="" />

            <p className="h5">{t("addVoice")}</p>
          </Stack>

          <Stack gap={3}>
            <Button onClick={onSignUpClick}>{t("signUp")}</Button>
            <Button
              variant="outline-primary"
              onClick={onSignInClick}
              // White at rest, on the popup's grey, with a 2px edge, its
              // padding 1px less on each side (bootstrap.scss) so it stays
              // the size of Sign up. Bootstrap's own variables, so its hover
              // fill still applies.
              style={
                {
                  "--bs-btn-bg": "var(--maple-surface-base)",
                  "--bs-btn-border-width": "2px",
                  "--bs-btn-padding-y": "calc(var(--maple-space-sm) - 1px)",
                  "--bs-btn-padding-x": "calc(var(--maple-space-xl) - 1px)"
                } as CSSProperties
              }
            >
              {t("signIn")}
            </Button>
          </Stack>
        </Col>
      </Modal.Body>
    </Modal>
  )
}
