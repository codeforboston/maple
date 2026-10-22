import { TabBlock } from "../../LegislatorComponents"
import { useTranslation } from "next-i18next"
import {
  StyledSubSectionHeaders,
  StyledBillsTab
} from "./StyledComponents/BillStyledComponents"
import { MemberContent } from "components/db"
import { BillsByTopic } from "./Bills/BillsByTopic"
import { RecentBills } from "./Bills/RecentBills"
import { CommitteePositions } from "./Committees/CommitteePositions"
import { Bill } from "functions/src/bills/types"

type BillGroups = {
  all: Bill[]
  sponsored: Bill[]
  cosponsored: Bill[]
}

export function BillsTabContainer({
  member,
  bills,
  court
}: {
  member: MemberContent
  bills: BillGroups
  court: number
}) {
  const { t } = useTranslation("legislators")

  return (
    <StyledBillsTab>
      <BillsByTopic billGroups={bills} court={member?.GeneralCourtNumber} />
      <RecentBills bills={bills.sponsored} member={member} court={court} />
      <CommitteePositions member={member} />
    </StyledBillsTab>
  )
}
