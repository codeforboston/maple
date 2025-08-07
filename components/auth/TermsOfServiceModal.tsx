import type { ModalProps } from "react-bootstrap"
import { Button, Col, Modal, Row, Stack } from "../bootstrap"
import { External } from "components/links"
import { NavLink } from "../Navlink"
import { useTranslation } from "next-i18next"
import { NEWSLETTER_SIGNUP_URL } from "components/common"

export default function TermsOfServiceModal({
  show,
  onHide,
  onAgree
}: Pick<ModalProps, "show" | "onHide" | "onAgree">) {
  const { t } = useTranslation("auth")
  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title id="tos-modal">{t("privacyAndTerms")}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Col md={12} className="mx-auto">
          <Stack gap={3} className="mb-4">
            <Row className="align-items-center">
              <Col md={9}>
                <h4>{t("privacyPolicy")}</h4>
              </Col>
              <Col md={3}>
                <External className={`text-decoration-none`} href="/policies">
                  {t("readMore")}
                </External>
              </Col>
              <hr className={`border border-5 border-black`} />
              <Col md={10}>
                <ul>
                  <li>{t("establishedPolicy")}</li>
                  <li>{t("infoStored")}</li>
                  <li>{t("infoShared")}</li>
                  <li>{t("noSale")}</li>
                </ul>
              </Col>
            </Row>
            <Row className="align-items-center">
              <Col md={9}>
                <h4>{t("TOS")}</h4>
              </Col>
              <Col md={3}>
                <External className={`text-decoration-none`} href="/policies">
                  {t("readMore")}
                </External>
              </Col>

              <hr className={`border border-5 border-black`} />
              <Col md={10}>
                <ul>
                  <li>{t("userUnderstands")}</li>
                  {/* Newsletter section commented out, will be reintroduced later with checkbox consent option */}
                  {/* <li>
                    {t("newsletterInfo")}
                  </li> */}
                </ul>
              </Col>
            </Row>

            <Col>
              <p className={`fw-bold`}>{t("agreeRequired")}</p>
              <Row>
                <Col md={6}>
                  <Button onClick={onAgree} className={`w-100`} size="sm">
                    {t("agreeSignUp")}
                  </Button>
                </Col>
                <Col md={6}>
                  <Button
                    onClick={onHide}
                    className={`w-100`}
                    size="sm"
                    variant="outline-primary"
                  >
                    {t("cancel")}
                  </Button>
                </Col>
              </Row>
              <Row>
                <NavLink
                  href={NEWSLETTER_SIGNUP_URL}
                  other={{
                    className: `text-center fs-5 mt-4 text-secondary`,
                    target: "_blank",
                    rel: "noopener noreferrer"
                  }}
                >
                  {t("subscribeNewsletter")}
                </NavLink>
              </Row>
            </Col>
          </Stack>
        </Col>
      </Modal.Body>
    </Modal>
  )
}
