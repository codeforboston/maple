import { StyledBillsTab } from "./StyledComponents/BillStyledComponents"
import { MemberContent } from "functions/src/members/types"
import { BillsByTopic } from "./Bills/BillsByTopic"
import { RecentBills } from "./Bills/RecentBills"
import { CommitteePositions } from "./Committees/CommitteePositions"
import { MemberBillSummary } from "functions/src/members/memberBillSummary"

export function BillsTabContainer({
  member,
  bills
}: {
  member: MemberContent | undefined
  bills: MemberBillSummary
}) {
  return (
    <StyledBillsTab>
      <BillsByTopic billGroups={bills} />
      <RecentBills
        bills={bills.recentSponsoredBills}
        totalCount={bills.sponsored.count}
      />
      <CommitteePositions member={member} />
    </StyledBillsTab>
  )
}
