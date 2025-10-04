import type { ButtonProps } from "react-bootstrap"
import { Button } from "../bootstrap"
import { useTestimonyEmail } from "./hooks"
import { useTranslation } from "next-i18next"

export const SendEmailButton = (props: ButtonProps) => {
  const { ready, mailToUrl } = useTestimonyEmail()
  const { t } = useTranslation("testimony")
  return ready ? (
    <Button
      href={mailToUrl}
      target="_blank"
      rel="noreferrer"
      variant="secondary"
      {...props}
    >
      {t("publish.sendEmail")}
    </Button>
  ) : null
}
