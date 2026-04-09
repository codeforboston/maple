import { NoResults } from "components/search/NoResults"
import { PaginationButtons } from "components/table"
import { TFunction, useTranslation } from "next-i18next"
import { useState } from "react"
import { Card as BootstrapCard, Col, Row } from "react-bootstrap"
import styled from "styled-components"
import { Card as MapleCard } from "../Card"
import { useAuth } from "../auth"
import { Testimony, UsePublishedTestimonyListing } from "../db"
import { SortTestimonyDropDown } from "./SortTestimonyDropDown"
import { Tab, Tabs } from "./Tabs"
import { TestimonyItem } from "./TestimonyItem"

const Head = styled(BootstrapCard.Header)`
  background-color: var(--bs-blue);
  color: white;
  font-size: 22px;
`

const ViewTestimony = (
  props: UsePublishedTestimonyListing & {
    search?: boolean
    totalTestimonies?: number | undefined
    onProfilePage?: boolean
    className?: string
    isOrg?: boolean
    variant?: "default" | "ballotQuestion"
    allowEdit?: boolean
  }
) => {
  const {
    items,
    setFilter,
    totalTestimonies,
    onProfilePage = false,
    className,
    pagination,
    isOrg,
    variant = "default",
    allowEdit = true
  } = props

  const { user } = useAuth()
  const { t } = useTranslation("testimony")
  const isBallotQuestion = variant === "ballotQuestion"
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
      label={
        isBallotQuestion
          ? t("ballotQuestion.viewTestimony.allPerspectives")
          : t("viewTestimony.allTestimonies")
      }
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

  const listContent =
    testimony.length > 0 ? (
      <div>
        {onProfilePage && (
          <Row className="justify-content-between mb-4">
            <ShowPaginationSummary
              totalTestimonies={totalTestimonies}
              testimony={testimony}
              pagination={pagination}
              t={t}
            />

            <Col xs="auto">
              <SortTestimonyDropDown
                orderBy={orderBy}
                setOrderBy={setOrderBy}
              />
            </Col>
          </Row>
        )}

        <FeedList>
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
                key={t.id}
                testimony={t}
                isUser={t.authorUid === user?.uid}
                onProfilePage={onProfilePage}
                variant={variant}
                allowEdit={allowEdit}
              />
            ))}
        </FeedList>

        {(pagination.hasPreviousPage || pagination.hasNextPage) && (
          <PaginationButtons pagination={pagination} />
        )}
      </div>
    ) : (
      <NoResults>
        {t(
          isBallotQuestion
            ? "ballotQuestion.viewTestimony.noPerspectives"
            : "viewTestimony.noTestimonies"
        )}
        <br />
      </NoResults>
    )

  if (variant === "ballotQuestion") {
    return (
      <FeedShell className={`${className ?? ""} bg-white`}>
        {!onProfilePage && (
          <>
            <Tabs
              childTabs={tabs}
              onChange={handleTabClick}
              selectedTab={activeTab}
              variant="ballotQuestion"
            />
            <ControlsRow className="justify-content-between align-items-center mb-4">
              <Col>
                <BrowseTitle>
                  {t("ballotQuestion.viewTestimony.browsePerspectives")}
                </BrowseTitle>
              </Col>
              <Col xs="auto">
                <SortTestimonyDropDown
                  orderBy={orderBy}
                  setOrderBy={setOrderBy}
                  variant="ballotQuestion"
                />
              </Col>
            </ControlsRow>
          </>
        )}
        {listContent}
      </FeedShell>
    )
  }

  return (
    <MapleCard
      className={`${className} bg-white`}
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
          {listContent}
        </BootstrapCard.Body>
      }
    />
  )
}

export default ViewTestimony

const FeedShell = styled.div`
  border: 1px solid #dee2e6;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 0.125rem 0.5rem rgba(15, 23, 42, 0.06);
`

const ControlsRow = styled(Row)`
  row-gap: 0.75rem;
`

const BrowseTitle = styled.div`
  font-size: 0.95rem;
  font-weight: 700;
`

const FeedList = styled.div`
  display: grid;
  gap: 0;
`

function ShowPaginationSummary({
  totalTestimonies,
  testimony,
  pagination,
  t
}: {
  totalTestimonies?: number
  testimony: Testimony[]
  pagination: { currentPage: number; itemsPerPage: number }
  t: TFunction
}) {
  if (totalTestimonies === undefined) {
    return null
  }

  if (testimony.length < 1) {
    return null
  }
  const { currentPage, itemsPerPage } = pagination

  const currentPageStart = (currentPage - 1) * itemsPerPage
  let currentPageEnd = Math.min(currentPage * itemsPerPage, totalTestimonies)
  // if (currentPageEnd > totalTestimonies) {
  //   currentPageEnd = totalTestimonies
  // }
  const totalItems = totalTestimonies

  return (
    <Col className="d-flex align-items-center">
      {t("viewTestimony.showing")} {currentPageStart + 1}&ndash;{currentPageEnd}{" "}
      {t("viewTestimony.outOf")}
      {totalItems}
    </Col>
  )
}
