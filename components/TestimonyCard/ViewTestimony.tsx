import { Row, Col, Form } from "react-bootstrap"
import React, { useState } from "react"
import { UsePublishedTestimonyListing } from "../db"
import { TitledSectionCard } from "../shared"
import { TestimonyItem } from "./TestimonyItem"
import { NoResults } from "components/search/NoResults"
import { PaginationButtons } from "components/table"
import { SortTestimonyDropDown } from "./SortTestimonyDropDown"

const ViewTestimony = (
  props: UsePublishedTestimonyListing & {
    search?: boolean
    isUser?: boolean
    showBillInfo?: boolean
    className?: string
    isOrg?: boolean
  }
) => {
  const {
    pagination,
    items,
    setFilter,
    isUser = false,
    showBillInfo = false,
    className,
    isOrg
  } = props

  const testimony = items.result ?? []
  const numtestimony = testimony.length

  const [orderBy, setOrderBy] = useState<string>()

  return (
    <TitledSectionCard
      title={isOrg ? "Our Testimonies" : "Testimonies"}
      className={className}
    >
      {testimony.length > 0 ? (
        <div>
          {showBillInfo ? (
            <Row className="justify-content-between mb-4">
              <Col className="d-flex align-items-center">
                Showing 1 - {numtestimony} out of {numtestimony}
              </Col>
              <Col xs="auto">
                <SortTestimonyDropDown
                  orderBy={orderBy}
                  setOrderBy={setOrderBy}
                />
              </Col>
            </Row>
          ) : (
            <>
              {/* Insert the individuals/orgs/alltestimonies tabs from mark's code  */}
            </>
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
                showBillInfo={showBillInfo}
              />
            ))}
        </div>
      ) : (
        <NoResults>
          There are no testimonies <br />
        </NoResults>
      )}

      <div className="p-3" />
      {/* <PaginationButtons pagination={pagination} /> */}
    </TitledSectionCard>
  )
}

export default ViewTestimony
