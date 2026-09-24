import { TabBlock } from "../../LegislatorComponents"
import { useTranslation } from "next-i18next"
import {
  StyledSubSectionHeaders,
  StyledBillsTab
} from "./StyledComponents/BillStyledComponents"
import { MemberContent } from "functions/src/members/types"
import { BillsByTopic } from "./Bills/BillsByTopic"
import { BillFilterButtons } from "./Bills/BillFilterButtons"
import { RecentBills } from "./Bills/RecentBills"
import { CommitteePositions } from "./Committees/CommitteePositions"

export function BillsTabContainer({
  member
}: {
  member: MemberContent | undefined
}) {
  const { t } = useTranslation("legislators")

  let tempCourt = 194
  let tempMember = "AMS3"

  // - LAST: bill filter button section
  // 1 - buttons have bill totals for sponsor and cosponsor and all
  // 2 - 'all' is default filter; sponsor + cosponsor being clicked trigger filters on those fields for 'bills by topic'

  // bills by topic
  // 1 - group all bills from current general court by legislator (master filter) by topic; order topic by most to least frequent; return top five
  // 2 - add sub-topics as blue topic tags; group by top 3/top 5 per topic

  // recent bills section
  // 1- display recent sponsored bills by bill number (link), title, topics (blue tags)
  // 2 - add table headers

  // committee positions section
  // 1 - display committee positions by committee, role, and duration
  // 2 - add table headers

  return (
    <StyledBillsTab>
      <BillFilterButtons member={member} />
      <BillsByTopic member={member} />
      <RecentBills />
      <CommitteePositions />
    </StyledBillsTab>
  )
}
