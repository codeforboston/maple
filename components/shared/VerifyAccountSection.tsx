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
  className,
  onlyVisibleNote = false
}: {
  user: User
  profile: Profile
  className: string
  /** "Only visible to you" at the far right of the heading, for a page others
   * can also see (the profile). Off by default. */
  onlyVisibleNote?: boolean
}) => {
  const sendEmailVerification = useSendEmailVerification()
  const { t } = useTranslation("auth")
  const [showPhoneModal, setShowPhoneModal] = useState(false)
  const [localPhoneVerified, setLocalPhoneVerified] = useState(
    profile.phoneVerified ?? false
  )

  return (
    // A plain white card with the title as a heading inside it, with room
    // above and below the content.
    <TitledSectionCard className={className}>
      <div className="mt-3 mb-3">
        <div className="d-flex flex-wrap align-items-baseline justify-content-between gap-2 mb-3">
          <h4 className="mb-0">{t("verifyAccountSection.title")}</h4>
          {/* Only the account's owner ever sees this card. */}
          {onlyVisibleNote && (
            <span className="small text-muted">
              {t("verifyAccountSection.onlyVisibleToYou")}
            </span>
          )}
        </div>
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
                    {t("verifyAccountSection.resend")}
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
      </div>
    </TitledSectionCard>
  )
}
