import type { ModalProps } from "react-bootstrap"
import { Button, Col, Modal, Row, Stack, Image } from "../bootstrap"
import styled from "styled-components"
import { useTranslation } from "next-i18next"

export const StyledButton = styled(Button)`
  width: 100%;
  height: 15rem;
  margin: 0;
  margin-bottom: 1rem;
  text-align: left;

  p {
    font-size: 16px;
    margin: 0;
  }

  Image {
    margin: 0;
  }
`

export default function ProfileTypeModal({
  show,
  onHide,
  onIndividualUserClick,
  onOrgUserClick
}: Pick<ModalProps, "show" | "onHide"> & {
  onHide: () => void
  onIndividualUserClick: () => void
  onOrgUserClick: () => void
}) {
  const { t } = useTranslation("auth")

  return (
    <Modal
      show={show}
      onHide={onHide}
      aria-labelledby="sign-up-modal"
      centered
      size="lg"
    >
      <Modal.Header closeButton>
        <Modal.Title id="sign-up-modal">{t("signUp")}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Col md={12} className="mx-auto">
          <Stack gap={2} direction="vertical">
            <h2>{t("registerAs")}</h2>
            <Stack gap={4} direction="horizontal">
              <StyledButton
                type="button"
                variant="secondary"
                onClick={onIndividualUserClick}
              >
                <Row>
                  <Col xs="auto" className="d-flex align-items-center">
                    <Image alt="" src="/profile-individual-white.svg" />
                  </Col>

                  <Col>
                    <p>
                      <b>{t("individualUser")}</b>
                    </p>
                    <p>{t("individualDescription")}</p>
                  </Col>
                </Row>
              </StyledButton>

              <StyledButton
                type="button"
                variant="secondary"
                onClick={onOrgUserClick}
              >
                <Row>
                  <Col xs="auto" className="d-flex align-items-center">
                    <Image alt="" src="/profile-org-white.svg" />
                  </Col>

                  <Col>
                    <p>
                      <b>{t("org")}</b>
                    </p>
                    <p>{t("orgDescription")}</p>
                  </Col>
                </Row>
              </StyledButton>
            </Stack>
            <p>{t("orgVetting")}</p>
            <hr />
            <Button type="button" onClick={onHide}>
              {t("cancel")}
            </Button>
          </Stack>
        </Col>
      </Modal.Body>
    </Modal>
  )
}
