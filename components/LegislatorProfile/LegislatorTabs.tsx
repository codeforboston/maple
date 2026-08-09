import { useTranslation } from "next-i18next"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
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

const tabCategories = {
  priorities: "priorities",
  bills: "bills",
  elections: "elections",
  finance: "finance",
  district: "district",
  testimony: "testimony",
  votes: "votes"
} as const
type TabCategory = (typeof tabCategories)[keyof typeof tabCategories]

const isTabCategory = (value?: string | null): value is TabCategory =>
  Object.values(tabCategories).some(category => category === value)

const tabCategoryFromPath = (path: string): TabCategory => {
  const hash = path.split("#", 2)[1]
  return isTabCategory(hash) ? hash : tabCategories.priorities
}

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
  finance
}: {
  district?: District | undefined
  districtLoading?: boolean
  legislatorId: string
  name: string
  finance?: MembersFinance
}) {
  const router = useRouter()
  const { t } = useTranslation("legislators")
  const [activeTab, setActiveTab] = useState<TabCategory>(
    tabCategories.priorities
  )

  useEffect(() => {
    if (router.isReady) setActiveTab(tabCategoryFromPath(router.asPath))
  }, [router.asPath, router.isReady])

  const handleTabSelect = (nextTab: string | null) => {
    if (!isTabCategory(nextTab)) return

    setActiveTab(nextTab)

    const [path, currentHash] = router.asPath.split("#", 2)
    if (currentHash === nextTab) return

    void router.push(`${path}#${nextTab}`, undefined, {
      shallow: true,
      scroll: false
    })
  }

  const tabs = [
    {
      title: t("tabs.priorities"),
      eventKey: tabCategories.priorities,
      content: <PrioritiesTab />
    },
    {
      title: t("tabs.bills"),
      eventKey: tabCategories.bills,
      content: <BillsTab />
    },
    {
      title: t("tabs.elections"),
      eventKey: tabCategories.elections,
      content: <ElectionsTab />
    },
    {
      title: t("tabs.finance"),
      eventKey: tabCategories.finance,
      content: <FinanceTab finance={finance} />
    },
    {
      title: t("tabs.district"),
      eventKey: tabCategories.district,
      content: <DistrictTab district={district} loading={districtLoading} />
    },
    {
      title: t("tabs.testimony"),
      eventKey: tabCategories.testimony,
      content: <TestimonyTab legislatorId={legislatorId} name={name} />
    },
    {
      title: t("tabs.votes"),
      eventKey: tabCategories.votes,
      content: <VotesTab />
    }
  ]

  return (
    <Container className={`p-0`}>
      <TabContainer activeKey={activeTab} onSelect={handleTabSelect}>
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
