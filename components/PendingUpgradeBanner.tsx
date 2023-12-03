import { MessageBanner } from "./shared/MessageBanner"
import { useTranslation } from "next-i18next"

export const PendingUpgradeBanner = () => {
  const { t } = useTranslation("common")
  return (
    <MessageBanner
      icon={"/Clock.svg"}
      heading={t("pending_upgrade_warning.header")}
      content={t("pending_upgrade_warning.content")}
    />
  )
}
