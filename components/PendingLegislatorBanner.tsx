import { MessageBanner } from "./shared/MessageBanner"
import { useTranslation } from "next-i18next"

export const PendingLegislatorBanner = () => {
  const { t } = useTranslation("common")
  return (
    <MessageBanner
      icon={"/Clock.svg"}
      heading={t("pending_legislator_warning.header")}
      content={t("pending_legislator_warning.content")}
    />
  )
}
