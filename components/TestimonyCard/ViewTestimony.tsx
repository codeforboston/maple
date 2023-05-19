import { Row, Col, Form } from "react-bootstrap"
import React, { useState } from "react"
import { UsePublishedTestimonyListing } from "../db"
import { TitledSectionCard } from "../shared"
import { TestimonyItem } from "./TestimonyItem"
import { NoResults } from "components/search/NoResults"
import { SortTestimonyDropDown } from "./SortTestimonyDropDown"
import { Card as MapleCard } from "../Card"
import { Card as BootstrapCard } from "react-bootstrap"
import styled from "styled-components"
import { PaginationButtons } from "components/table"
import { Tabs, Tab } from "./Tabs"
import { useTranslation } from "next-i18next"

const Container = styled.div`
  font-family: Nunito;
`
const Head = styled(BootstrapCard.Header)`
  background-color: var(--bs-blue);
  color: white;
  font-size: 22px;
`

const ViewTestimony = (
  props: UsePublishedTestimonyListing & {
    search?: boolean
    isUser?: boolean
    onProfilePage?: boolean
    className?: string
    isOrg?: boolean
  }
) => {
  const {
    items,
    setFilter,
    isUser = false,
    onProfilePage = false,
    className,
    pagination,
    isOrg
  } = props

  const testimony = items.result ?? []
  const [orderBy, setOrderBy] = useState<string>()
  const [activeTab, setActiveTab] = useState(1)

  const handleTabClick = (e: Event, value: number) => {
    setActiveTab(value)
  }

  const handleFilter = (filter: string | undefined) => {
    if (filter === "organization") {
      setFilter({ authorRole: "organization" })
    }
    if (filter === "user") {
      setFilter({ authorRole: "user" })
    }
    if (filter === "") {
      setFilter({ authorRole: "" })
    }
  }

  const tabs = [
    <Tab
      key="at"
      label="All Testimonies"
      active={false}
      value={1}
      action={() => handleFilter("")}
    />,
    <Tab
      key="uo"
      label="Individuals"
      active={false}
      value={2}
      action={() => handleFilter("user")}
    />,
    <Tab
      key="oo"
      label="Organizations"
      active={false}
      value={3}
      action={() => handleFilter("organization")}
    />
  ]

  const { t } = useTranslation("testimony")

  return (
    <Container>
      <MapleCard
        className={className}
        headerElement={<Head>{isOrg ? "Our Testimonies" : "Testimonies"}</Head>}
        body={
          <BootstrapCard.Body>
            {!onProfilePage && (
              <Row>
                <Tabs
                  childTabs={tabs}
                  onChange={handleTabClick}
                  selectedTab={activeTab}
                />
              </Row>
            )}

            {testimony.length > 0 ? (
              <div>
                {onProfilePage && (
                  <Row className="justify-content-between mb-4">
                    <Col className="d-flex align-items-center">
                      {t("viewTestimony.showing1")}{testimony.length}{t("viewTestimony.outOf")}{testimony.length}
                    </Col>
                    <Col xs="auto">
                      <SortTestimonyDropDown
                        orderBy={orderBy}
                        setOrderBy={setOrderBy}
                      />
                    </Col>
                  </Row>
                )}

                {testimony
                  .sort((a, b) =>
                    orderBy === "Oldest First"
                      ? a.publishedAt > b.publishedAt
                        ? 1
                        : -1
                      : a.publishedAt < b.publishedAt
                      ? 1
                      : -1
                  )
                  .map(t => (
                    <TestimonyItem
                      key={t.authorUid + t.billId}
                      testimony={t}
                      isUser={isUser}
                      onProfilePage={onProfilePage}
                    />
                  ))}

                {testimony.length > 10 && (
                  <PaginationButtons pagination={pagination} />
                )}
              </div>
            ) : (
              <NoResults>
                {t("viewTestimony.noTestimonies")}<br />
              </NoResults>
            )}
          </BootstrapCard.Body>
        }
      />
    </Container>
  )
}

export default ViewTestimony
