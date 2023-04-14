import { useSendEmailVerification } from "components/auth/hooks"
import { TitledSectionCard } from "components/shared"
import { Alert } from "react-bootstrap"
import { User } from "firebase/auth"
import { LoadingButton } from "components/buttons"
import { useTranslation } from "next-i18next"

export const VerifyAccountSection = ({
  user,
  className
}: {
  user: User
  className: string
}) => {
  const sendEmailVerification = useSendEmailVerification()
  const { t } = useTranslation("profile")

  return (
    <TitledSectionCard title={"Verify Your Account"} className={className}>
      <div>
        <p className="fw-bold text-info">
          {t("verifyAccountSection.verifyAccount")}
        </p>

        {sendEmailVerification.status === "success" ? (
          <Alert variant="success"> {t("verifyAccountSection.checkEmail")} </Alert>
        ) : null}

        {sendEmailVerification.status === "error" ? (
          <Alert variant="danger">{sendEmailVerification.error?.message}</Alert>
        ) : null}

        {sendEmailVerification.status !== "success" ? (
          <LoadingButton
            variant="info"
            className="text-white"
            loading={sendEmailVerification.loading}
            onClick={() => sendEmailVerification.execute(user)}
          >
            {t("verifyAccountSection.sendAnotherLink")}
          </LoadingButton>
        ) : null}
      </div>
    </TitledSectionCard>
  )
}
