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
    showBillInfo?: boolean
    className?: string
    isOrg?: boolean
  }
) => {
  const {
    items,
    setFilter,
    isUser = false,
    showBillInfo = false,
    className,
    isOrg
  } = props

  const testimony = items.result ?? []

  const [orderBy, setOrderBy] = useState<string>()

  return (
    <Container>
      <MapleCard
        className={className}
        headerElement={<Head>{isOrg ? "Our Testimonies" : "Testimonies"}</Head>}
        body={
          <BootstrapCard.Body>
            {testimony.length > 0 ? (
              <div>
                {showBillInfo ? (
                  <Row className="justify-content-between mb-4">
                    <Col className="d-flex align-items-center">
                      Showing 1 - {testimony.length} out of {testimony.length}
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
          </BootstrapCard.Body>
        }
      />

      {/* <PaginationButtons pagination={pagination} /> */}
    </Container>
  )
}

export default ViewTestimony
