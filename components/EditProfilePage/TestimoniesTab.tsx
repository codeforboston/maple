import { useState } from "react"
import { Col, Row } from "../bootstrap"
import { TitledSectionCard } from "../shared"
import { TestimonyItem } from "components/TestimonyCard/TestimonyItem"
import { SortTestimonyDropDown } from "components/TestimonyCard/SortTestimonyDropDown"
import { TestimonyFAQ } from "./TestimonyFAQ"
import { Testimony } from "../db"
import { Title } from "react-admin"

export const TestimoniesTab = ({
  publishedTestimonies,
  draftTestimonies,
  className
}: {
  publishedTestimonies: Testimony[] | undefined
  draftTestimonies: Testimony[] | undefined
  className: string
}) => {
  const [orderBy, setOrderBy] = useState<string>()

  return (
    <div className="mb-4">
      <Row className="mt-0">
        <Col xs={8}>
          <TitledSectionCard className={className}>
            <Row>
              <Col>
                <h2>Published Testimonies</h2>
              </Col>
              <Col xs="auto">
                <SortTestimonyDropDown
                  orderBy={orderBy}
                  setOrderBy={setOrderBy}
                />
              </Col>
            </Row>

            {publishedTestimonies &&
              publishedTestimonies
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
                    isUser={true}
                    showBillInfo={true}
                    canEdit={true}
                    canDelete={true}
                  />
                ))}
          </TitledSectionCard>
          <TitledSectionCard className={className}>
            <h2>Draft Testimonies</h2>
            {draftTestimonies &&
              draftTestimonies.map(t => (
                <TestimonyItem
                  key={t.authorUid + t.billId}
                  testimony={t}
                  isUser={true}
                  showBillInfo={true}
                  canEdit={true}
                  canDelete={false}
                />
              ))}
          </TitledSectionCard>
        </Col>
        <Col>
          <TestimonyFAQ className={className}></TestimonyFAQ>
        </Col>
      </Row>
    </div>
  )
}
