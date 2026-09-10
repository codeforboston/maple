import { useTranslation } from "next-i18next"

import { SidebarBlock, SidebarTitle } from "../LegislatorSidebar"

export function OtherTestimony() {
  const { t } = useTranslation("legislators")

  return (
    <SidebarBlock className="mb-2">
      <SidebarTitle className={`my-1`}>{t("otherTestimony")}</SidebarTitle>
      <div>Content To Be Added</div>
    </SidebarBlock>
  )
}
