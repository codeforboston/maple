import { TabBlock } from "../../LegislatorComponents"
import { Button } from "react-bootstrap"
import { useTranslation } from "next-i18next"
import styled from "styled-components"
import { useMember } from "components/db"
import { Row, Spinner } from "react-bootstrap"
import { MemberContent } from "functions/src/members/types"

const BillFilterButtons = ({
  member
}: {
  member: MemberContent | undefined
}) => {
  const { t } = useTranslation("legislators")

  const sponsoredBills = member?.SponsoredBills?.length ?? 0
  const coSponsoredBills = member?.CoSponsoredBills?.length ?? 0
  const allBills = sponsoredBills + coSponsoredBills

  return (
    <StyledButtonFilterGroup>
      <StyledButtonBase>
        <div>{sponsoredBills}</div>
        <div>{t("billsSponsored")}</div>
      </StyledButtonBase>
      <StyledButtonBase>
        <div>{coSponsoredBills}</div>
        <div>{t("cosponsored")}</div>
      </StyledButtonBase>
      <StyledButtonBase>
        <div>{t("All")}</div>
        <div>{allBills}</div>
      </StyledButtonBase>
    </StyledButtonFilterGroup>
  )
}

const BillsByTopic = () => {
  const { t } = useTranslation("legislators")

  return (
    <StyledBillsByTopic>
      <StyledBillsByTopicHeader>
        <StyledBillsByTopicHeaderTitle>
          {t("profiles.billsByTopic")}
        </StyledBillsByTopicHeaderTitle>
        <StyledBillsByTopicHeaderSubtitle>
          23 {t("profiles.bills")} • {t("profiles.primarySponsor")}
        </StyledBillsByTopicHeaderSubtitle>
      </StyledBillsByTopicHeader>
    </StyledBillsByTopic>
  )
}

const RecentBills = () => {
  const { t } = useTranslation("legislators")

  return (
    <div>
      <StyledSubSectionHeaders>
        {t("profiles.recentSponsoredBills.header")}
      </StyledSubSectionHeaders>
      <TabBlock>Body</TabBlock>
    </div>
  )
}

const CommitteePositions = () => {
  const { t } = useTranslation("legislators")

  return (
    <div>
      <StyledSubSectionHeaders>
        {t("profiles.committeePositions.header")}
      </StyledSubSectionHeaders>
      <TabBlock>
        <StyledSubsectionTable></StyledSubsectionTable>
      </TabBlock>
    </div>
  )
}

export function BillsTab() {
  const { t } = useTranslation("legislators")

  let tempCourt = 194
  let tempMember = "AMS3"

  const { member, loading: memberLoading } = useMember(tempCourt, tempMember)

  if (memberLoading) {
    return (
      <Row>
        <Spinner animation="border" className="mx-auto" />
      </Row>
    )
  }

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
      <BillFilterButtons member={member} />
      <BillsByTopic />
      <RecentBills />
      <CommitteePositions />
    </StyledBillsTab>
  )
}

const StyledBillsTab = styled.div``

const StyledBillsByTopic = styled(TabBlock)`
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

const StyledBillsByTopicHeaderTitle = styled.div`
  font-size: 1rem;
  font-weight: 700;
  color: #0f172a;
`

const StyledBillsByTopicHeaderSubtitle = styled.div`
  font-size: 0.8125rem;
  color: #64748b;
`

const StyledSubSectionHeaders = styled.div`
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #64748b;
  margin: 1.5rem 0 0.75rem 0;
`

const StyledSubsectionTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: left;
`

const StyledSubsectionTableColumnHeader = styled.th`
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #64748b;
  padding: 0.75rem 1.25rem;
  border-bottom: 1px solid #e2e8f0;
`

const StyledSubsectionTableColumnData = styled.td`
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #f1f5f9;
  font-size: 0.9rem;
  color: #334155;
  vertical-align: middle;
`

const StyledButtonFilterGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
`

const StyledButtonBase = styled(Button)`
  display: flex;
  gap: 0.5rem;
  padding: 0.4rem 0.9rem;
  font-size: 0.875rem;
  font-weight: 600;
  border-radius: 6px;
  border: 1px solid #cbd5e1;
  background-color: #ffffff;
  color: #475569;
  cursor: pointer;
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
