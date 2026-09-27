import { TabBlock } from "../../LegislatorComponents"
import { useTranslation } from "next-i18next"
import {
  StyledSubSectionHeaders,
  StyledBillsTab
} from "./StyledComponents/BillStyledComponents"
import { MemberContent } from "functions/src/members/types"
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
  bills
}: {
  member: MemberContent | undefined
  bills: BillGroups
}) {
  const { t } = useTranslation("legislators")

  return (
    <StyledBillsTab>
      <BillsByTopic bills={bills.all} billGroups={bills} />
      <RecentBills bills={bills.sponsored} />
      <CommitteePositions member={member} />
    </StyledBillsTab>
  )
}
