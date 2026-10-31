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
import { MemberBillSummary } from "functions/src/members/memberBillSummary"

export function BillsTabContainer({
  member,
  summary,
  court
}: {
  member: MemberContent
  summary: MemberBillSummary
  court: number
}) {
  const { t } = useTranslation("legislators")

  return (
    <StyledBillsTab>
      <BillsByTopic summary={summary} court={member?.GeneralCourtNumber} />
      <RecentBills
        bills={summary.recentSponsoredBills}
        billCount={summary.sponsored.count}
        member={member}
        court={court}
      />
      <CommitteePositions member={member} />
    </StyledBillsTab>
  )
}
