import { useTranslation } from "next-i18next"

import { SidebarBlock, SidebarTitle } from "../LegislatorSidebar"

import { usePublishedTestimonyListing } from "components/db"

export function OtherTestimony({ sponsoredBills }: { sponsoredBills: any[] }) {
  const { t } = useTranslation("legislators")

  console.log("S: ", sponsoredBills)

  const bill: string = "H1316"
  const test = usePublishedTestimonyListing({ billId: bill })

  console.log("Test: ", test)

  return (
    <SidebarBlock className="mb-2">
      <SidebarTitle className={`my-1`}>{t("otherTestimony")}</SidebarTitle>
      <div>Content To Be Added</div>
    </SidebarBlock>
  )
}
