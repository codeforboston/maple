import { TabBlock } from "components/LegislatorProfile/LegislatorComponents"
import { useTranslation } from "next-i18next"
import {
  StyledBillId,
  StyledRecentBillsFooter,
  StyledSubSectionHeaders,
  StyledSubsectionTable,
  StyledSubsectionTableColumnData,
  StyledSubsectionTableColumnHeader,
  StyledSubtopicTag,
  StyledTitleCell,
  StyledTopicLink
} from "../StyledComponents/BillStyledComponents"
import { RecentSponsoredBill } from "functions/src/members/memberBillSummary"
import { billSearchByPrimarySponsor } from "components/links"
import { MemberContent } from "components/db"

export const RecentBills = ({
  bills,
  billCount,
  court,
  member
}: {
  bills: RecentSponsoredBill[]
  billCount: number
  court: number
  member: MemberContent
}) => {
  const { t } = useTranslation("legislators")

  return (
    <div>
      <StyledSubSectionHeaders>
        {t("profiles.recentSponsoredBills.header")}
      </StyledSubSectionHeaders>
      <TabBlock>
        <StyledSubsectionTable>
          <thead>
            <tr>
              <StyledSubsectionTableColumnHeader>
                {t("profiles.recentSponsoredBills.bill")}
              </StyledSubsectionTableColumnHeader>
              <StyledSubsectionTableColumnHeader>
                {t("profiles.recentSponsoredBills.title")}
              </StyledSubsectionTableColumnHeader>
              <StyledSubsectionTableColumnHeader>
                {t("profiles.recentSponsoredBills.topics")}
              </StyledSubsectionTableColumnHeader>
            </tr>
          </thead>
          <tbody>
            {bills.map(bill => (
              <tr key={bill.id}>
                <StyledSubsectionTableColumnData>
                  <StyledBillId>{bill.id}</StyledBillId>
                </StyledSubsectionTableColumnData>
                <StyledSubsectionTableColumnData>
                  <StyledTitleCell>{bill.title}</StyledTitleCell>
                </StyledSubsectionTableColumnData>
                <StyledSubsectionTableColumnData>
                  <StyledSubtopicTag>{bill.topic}</StyledSubtopicTag>
                </StyledSubsectionTableColumnData>
              </tr>
            ))}
          </tbody>
        </StyledSubsectionTable>
        <StyledRecentBillsFooter>
          <StyledTopicLink href={billSearchByPrimarySponsor(court, member)}>
            {t("profiles.recentSponsoredBills.viewBills", {
              number: billCount
            })}
          </StyledTopicLink>
        </StyledRecentBillsFooter>
      </TabBlock>
    </div>
  )
}
