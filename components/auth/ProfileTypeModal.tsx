import type { ModalProps } from "react-bootstrap"
import { Button, Col, Modal, Stack, Image } from "../bootstrap"
import styled from "styled-components"
import { useTranslation } from "next-i18next"
import { useFlags } from "../featureFlags"

export const StyledButton = styled(Button)`
  flex: 1;
  min-height: 8rem;
  margin: 0;
  text-align: left;
  display: flex;
  flex-direction: column;
  padding: 2rem;
  gap: 2rem;

  p {
    font-size: 16px;
    margin: 0;
    text-align: left;
  }

  img {
    width: 48px;
    height: 48px;
    flex-shrink: 0;
  }
`

export default function ProfileTypeModal({
  show,
  onHide,
  onIndividualUserClick,
  onOrgUserClick,
  onLegislatorUserClick
}: Pick<ModalProps, "show" | "onHide"> & {
  onHide: () => void
  onIndividualUserClick: () => void
  onOrgUserClick: () => void
  onLegislatorUserClick: () => void
}) {
  const { t } = useTranslation("auth")
  const { legislators } = useFlags()

  return (
    <Modal
      show={show}
      onHide={onHide}
      aria-labelledby="sign-up-modal"
      centered
      size="xl"
    >
      <Modal.Header closeButton>
        <Modal.Title id="sign-up-modal">{t("signUp")}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Col md={12} className="mx-auto">
          <Stack gap={4} direction="vertical">
            <h2>{t("registerAs")}</h2>
            <div className="d-flex flex-column flex-md-row align-items-stretch gap-4">
              <StyledButton
                type="button"
                variant="secondary"
                onClick={onIndividualUserClick}
              >
                <div className="d-flex align-items-center gap-4 flex-nowrap">
                  <Image alt="" src="/profile-individual-white.svg" />
                  <p>
                    <b>{t("individualUser")}</b>
                  </p>
                </div>
                <p>{t("individualDescription")}</p>
              </StyledButton>

              <StyledButton
                type="button"
                variant="secondary"
                onClick={onOrgUserClick}
              >
                <div className="d-flex align-items-center gap-4 flex-nowrap">
                  <Image alt="" src="/profile-org-white.svg" />
                  <p>
                    <b>{t("org")}</b>
                  </p>
                </div>
                <p>{t("orgDescription")}</p>
              </StyledButton>

              {legislators && (
                <StyledButton
                  type="button"
                  variant="secondary"
                  onClick={onLegislatorUserClick}
                >
                  <div className="d-flex align-items-center gap-4 flex-nowrap">
                    <Image alt="" src="/profile-legislator-white.svg" />
                    <p>
                      <b>{t("legislator")}</b>
                    </p>
                  </div>
                  <p>{t("legislatorDescription")}</p>
                </StyledButton>
              )}
            </div>
            <p>{t("orgVetting")}</p>
          </Stack>
          <hr />
          <Button type="button" className="w-100" onClick={onHide}>
            {t("cancel")}
          </Button>
        </Col>
      </Modal.Body>
    </Modal>
  )
}
