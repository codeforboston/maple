import { useState } from "react"
import { useSendEmailVerification } from "components/auth/hooks"
import { TitledSectionCard } from "components/shared"
import { Alert, Card, Col, Row } from "components/bootstrap"
import { User } from "firebase/auth"
import { LoadingButton } from "components/buttons"
import { Trans, useTranslation } from "next-i18next"
import { PhoneVerificationModal } from "components/shared/PhoneVerificationModal"
import { Profile } from "components/db/profile/types"

export const VerifyAccountSection = ({
  user,
  profile,
  className
}: {
  user: User
  profile: Profile
  className: string
}) => {
  const sendEmailVerification = useSendEmailVerification()
  const { t } = useTranslation("auth")
  const [showPhoneModal, setShowPhoneModal] = useState(false)
  const [localPhoneVerified, setLocalPhoneVerified] = useState(
    profile.phoneVerified ?? false
  )

  return (
    <TitledSectionCard
      title={t("verifyAccountSection.title")}
      className={className}
    >
      <p>
        <Trans
          t={t}
          i18nKey="verifyAccountSection.description"
          components={{ bold: <strong /> }}
        />
      </p>
      <Row className="g-3">
        <Col xs={12} md={6}>
          <Card className="h-100 border rounded-3 p-3 bg-light d-flex flex-row align-items-start">
            <div className="flex-grow-1">
              <p className="fw-bold mb-1">
                {t("verifyAccountSection.emailHeader")}
              </p>
              {user.emailVerified ? (
                <p className="mb-0">
                  {t("verifyAccountSection.successMessage")}
                </p>
              ) : (
                <>
                  <p className="mb-1">
                    {t("verifyAccountSection.verifyEmail")}
                  </p>
                  <p className="mb-0">
                    {t("verifyAccountSection.verifyEmailSpam")}
                  </p>
                  {sendEmailVerification.status === "success" ? (
                    <Alert variant="success" className="mb-0 mt-2">
                      {t("verifyAccountSection.checkEmail")}
                    </Alert>
                  ) : null}
                  {sendEmailVerification.status === "error" ? (
                    <Alert variant="danger" className="mb-0 mt-2">
                      {sendEmailVerification.error?.message}
                    </Alert>
                  ) : null}
                </>
              )}
            </div>
            {!user.emailVerified &&
            sendEmailVerification.status !== "success" ? (
              <div className="ms-3 flex-shrink-0">
                <LoadingButton
                  variant="outline-secondary"
                  loading={sendEmailVerification.loading}
                  onClick={() => sendEmailVerification.execute(user)}
                  style={{
                    width: "5.5rem",
                    height: "4rem",
                    whiteSpace: "normal",
                    lineHeight: "1.5",
                    padding: "0.5rem 0.75rem"
                  }}
                >
                  {t("verifyAccountSection.sendAnotherLink")}
                </LoadingButton>
              </div>
            ) : null}
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card className="h-100 border rounded-3 p-3 bg-light d-flex flex-row align-items-start">
            <div className="flex-grow-1">
              <p className="fw-bold mb-1">
                {t("verifyAccountSection.phoneHeader")}
              </p>
              <p className="mb-0">
                {localPhoneVerified
                  ? t("verifyAccountSection.successMessage")
                  : t("verifyAccountSection.phoneDescription")}
              </p>
            </div>
            {!localPhoneVerified ? (
              <div className="ms-3 flex-shrink-0">
                <LoadingButton
                  variant="outline-secondary"
                  loading={false}
                  onClick={() => setShowPhoneModal(true)}
                  style={{
                    width: "5.5rem",
                    height: "4rem",
                    whiteSpace: "normal",
                    lineHeight: "1.5",
                    padding: "0.5rem 0.75rem"
                  }}
                >
                  {t("verifyAccountSection.verifyPhone")}
                </LoadingButton>
              </div>
            ) : null}
          </Card>
        </Col>
      </Row>
      <PhoneVerificationModal
        show={showPhoneModal}
        onHide={() => setShowPhoneModal(false)}
        onVerified={() => setLocalPhoneVerified(true)}
      />
    </TitledSectionCard>
  )
}
