import { useTranslation } from "next-i18next"
import { TabPane } from "react-bootstrap"
import TabContainer from "react-bootstrap/TabContainer"
import styled from "styled-components"

import { Container, Nav } from "../bootstrap"

import { BillsTab } from "./TabComponents/BillsTab"
import { DistrictTab } from "./TabComponents/DistrictTab"
import { ElectionsTab } from "./TabComponents/ElectionsTab"
import { FinanceTab } from "./TabComponents/FinanceTab"
import { PrioritiesTab } from "./TabComponents/PrioritiesTab"
import { TestimonyTab } from "./TabComponents/TestimonyTab"
import { VotesTab } from "./TabComponents/VotesTab"

import { District } from "components/db"
import {
  StyledTabContent,
  TabNavWrapper,
  TabType
} from "components/EditProfilePage/StyledEditProfileComponents"
import { MembersFinance } from "components/db/membersFinance"

const tabCategory = [
  "priorities",
  "bills",
  "elections",
  "finance",
  "district",
  "testimony",
  "votes"
]
type TabCategories = (typeof tabCategory)[number]

const TabNavLink = styled(Nav.Link).attrs(props => ({
  className: `rounded-top m-0 p-0 ${props.className}`
}))`
  color: #6c757d;

  &.active {
    color: #1a3185;
    font-weight: bold;
  }
`

const TabNavItem = ({
  tab,
  i: i,
  className
}: {
  tab: TabType
  i: number
  className?: string
}) => {
  return (
    <Nav.Item className={`flex-lg-fill ${className}`} key={tab.eventKey}>
      <TabNavLink eventKey={tab.eventKey} className={`rounded-top m-0 p-0`}>
        <p className={`fs-6 my-0 text-nowrap ${i === 0 ? "" : "mx-4"}`}>
          {tab.title}
        </p>
        <hr className={`my-0`} />
      </TabNavLink>
    </Nav.Item>
  )
}

export function LegislatorTabs({
  district,
  districtLoading,
  legislatorId,
  name,
  tabCategory,
  finance
}: {
  district?: District | undefined
  districtLoading?: boolean
  legislatorId: string
  name: string
  tabCategory?: TabCategories
  finance?: MembersFinance
}) {
  const { t } = useTranslation("legislators")

  const tabs = [
    {
      title: t("tabs.priorities"),
      eventKey: "priorities",
      content: <PrioritiesTab />
    },
    {
      title: t("tabs.bills"),
      eventKey: "bills",
      content: <BillsTab />
    },
    {
      title: t("tabs.elections"),
      eventKey: "elections",
      content: <ElectionsTab />
    },
    {
      title: t("tabs.finance"),
      eventKey: "finance",
      content: <FinanceTab finance={finance} />
    },
    {
      title: t("tabs.district"),
      eventKey: "district",
      content: <DistrictTab district={district} loading={districtLoading} />
    },
    {
      title: t("tabs.testimony"),
      eventKey: "testimony",
      content: <TestimonyTab legislatorId={legislatorId} name={name} />
    },
    {
      title: t("tabs.votes"),
      eventKey: "votes",
      content: <VotesTab />
    }
  ]

  return (
    <Container className={`p-0`}>
      <TabContainer defaultActiveKey="priorities" activeKey={tabCategory}>
        <TabNavWrapper>
          {tabs.map((t, i) => (
            <TabNavItem key={i} tab={t} i={i} />
          ))}
        </TabNavWrapper>
        <StyledTabContent>
          {tabs.map(t => (
            <TabPane key={t.eventKey} title={t.title} eventKey={t.eventKey}>
              {t.content}
            </TabPane>
          ))}
        </StyledTabContent>
      </TabContainer>
    </Container>
  )
}
