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

export function BillsTabContainer({
  member,
  bills
}: {
  member: MemberContent | undefined
  bills: Bill[]
}) {
  const { t } = useTranslation("legislators")

  return (
    <StyledBillsTab>
      <BillsByTopic member={member} bills={bills} />
      <RecentBills />
      <CommitteePositions />
    </StyledBillsTab>
  )
}
