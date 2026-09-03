import { useTranslation } from "next-i18next"

import { SidebarBlock, SidebarTitle } from "../LegislatorSidebar"

import { usePublishedTestimonyListing } from "components/db"

export function OtherTestimony({
  court,
  sponsoredBills
}: {
  court: number
  sponsoredBills: any[]
}) {
  const { t } = useTranslation("legislators")

  const testimonyOnLegislatorBills: any[] = []

  sponsoredBills.forEach(bill => {
    const data = usePublishedTestimonyListing({
      billId: bill,
      court: court
    })

    data.items.result?.length
      ? testimonyOnLegislatorBills.push(data.items.result)
      : null
  })

  console.log("X: ", testimonyOnLegislatorBills)

  // console.log("S: ", sponsoredBills)

  return (
    <SidebarBlock className="mb-2">
      <SidebarTitle className={`my-1`}>{t("otherTestimony")}</SidebarTitle>
      <div>Content To Be Added</div>
    </SidebarBlock>
  )
}
