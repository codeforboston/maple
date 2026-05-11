import { useTranslation } from "next-i18next"
import { TabPane } from "react-bootstrap"
import TabContainer from "react-bootstrap/TabContainer"
import styled from "styled-components"

import { Container, Nav } from "../../bootstrap"

import { Bills } from "./Bills"
import { District } from "./District"
import { Elections } from "./Elections"
import { Finance } from "./Finance"
import { Priorities } from "./Priorities"
import { Testimony } from "./Testimony"
import { Votes } from "./Votes"

import {
  StyledTabContent,
  TabNavWrapper,
  TabType
} from "components/EditProfilePage/StyledEditProfileComponents"

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
  tabCategory
}: {
  tabCategory?: TabCategories
}) {
  const { t } = useTranslation("legislators")

  const tabs = [
    {
      title: t("tabs.priorities"),
      eventKey: "priorities",
      content: <Priorities />
    },
    {
      title: t("tabs.bills"),
      eventKey: "bills",
      content: <Bills />
    },
    {
      title: t("tabs.elections"),
      eventKey: "elections",
      content: <Elections />
    },
    {
      title: t("tabs.finance"),
      eventKey: "finance",
      content: <Finance />
    },
    {
      title: t("tabs.district"),
      eventKey: "district",
      content: <District />
    },
    {
      title: t("tabs.testimony"),
      eventKey: "testimony",
      content: <Testimony />
    },
    {
      title: t("tabs.votes"),
      eventKey: "votes",
      content: <Votes />
    }
  ]

  return (
    <Container>
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
