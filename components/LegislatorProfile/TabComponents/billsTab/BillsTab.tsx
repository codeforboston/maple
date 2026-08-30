import { TabBlock } from "../../LegislatorComponents"
import { useTranslation } from "next-i18next"
import styled from "styled-components"

const BillsByTopic = () => {
  const { t } = useTranslation("legislators")

  return <div>{t("billsByTopic")}</div>
}

export function BillsTab() {
  const { t } = useTranslation("legislators")

  // - LAST: bill filter button section
  // 1 - buttons have bill totals for sponsor and cosponsor and all
  // 2 - 'all' is default filter; sponsor + cosponsor being clicked trigger filters on those fields for 'bills by topic'

  // bills by topic
  // 1 - group all bills from current general court by legislator (master filter) by topic; order topic by most to least frequent; return top five
  // 2 - add sub-topics as blue topic tags; group by top 3/top 5 per topic

  // recent bills section
  // 1- display recent sponsored bills by bill number (link), title, topics (blue tags) and status (color coded tags)
  // 2 - add table headers

  // committee positions section
  // 1 - display committee positions by committee, role, and duration
  // 2 - add table headers

  return (
    <StyledBillsTab>
      <BillsByTopic />
    </StyledBillsTab>
  )
}

const StyledBillsTab = styled(TabBlock)`
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  margin-bottom: 1.5rem;
`

const StyledBillsByTopicHeader = styled.div`
  padding: 1rem 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f1f5f9;
`

/* 
      <div>
        <div>
          {member.SponsoredBills.length} {t("billsSponsored")}
        </div>
        <div>
          {member.CoSponsoredBills.length} {t("cosponsored")}
        </div>
        <div>
          {member.CoSponsoredBills.length + member?.SponsoredBills.length}{" "}
          {t("cosponsored")}
        </div>
      </div>
*/
