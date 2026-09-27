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
import { Bill } from "functions/src/bills/types"

export const RecentBills = ({ bills }: { bills: Bill[] }) => {
  const { t } = useTranslation("legislators")

  const lastFiveSponsoredBills = bills.slice(0, 5)

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
            {lastFiveSponsoredBills.map(bill => (
              <tr>
                <StyledSubsectionTableColumnData>
                  <StyledBillId>{bill.id}</StyledBillId>
                </StyledSubsectionTableColumnData>
                <StyledSubsectionTableColumnData>
                  <StyledTitleCell>{bill.content.Title}</StyledTitleCell>
                </StyledSubsectionTableColumnData>
                <StyledSubsectionTableColumnData>
                  <StyledSubtopicTag>
                    {bill.topics ? bill.topics[1].topic : ""}
                  </StyledSubtopicTag>
                </StyledSubsectionTableColumnData>
              </tr>
            ))}
          </tbody>
        </StyledSubsectionTable>
        <StyledRecentBillsFooter>
          {t("profiles.recentSponsoredBills.viewBills", {
            number: bills.length ?? 0
          })}
        </StyledRecentBillsFooter>
      </TabBlock>
    </div>
  )
}
