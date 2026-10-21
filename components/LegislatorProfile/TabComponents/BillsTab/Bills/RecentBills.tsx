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
  StyledTitleCell
} from "../StyledComponents/BillStyledComponents"
import { RecentSponsoredBill } from "functions/src/members/memberBillSummary"

export const RecentBills = ({
  bills,
  totalCount
}: {
  bills: RecentSponsoredBill[]
  totalCount: number
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
          {t("profiles.recentSponsoredBills.viewBills", {
            number: totalCount
          })}
        </StyledRecentBillsFooter>
      </TabBlock>
    </div>
  )
}
