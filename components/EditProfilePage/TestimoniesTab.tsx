import { useState } from "react"
import { Col, Row } from "../bootstrap"
import { UsePublishedTestimonyListing } from "../db"
import { TitledSectionCard } from "../shared"
import { TestimonyItem } from "components/TestimonyCard/TestimonyItem"
import { SortTestimonyDropDown } from "components/TestimonyCard/SortTestimonyDropDown"
import { TestimonyFAQ } from "./TestimonyFAQ"
import { Title } from "react-admin"


export const TestimoniesTab = (
   props: UsePublishedTestimonyListing & {
    className: string
   }
) => {
    const {
        items, 
        className
    } = props

  const publishedTestimonies = items.result ?? []
  const [orderBy, setOrderBy] = useState<string>()


  return (
    < div className="mb-5">
        <Row>
            <Col xs={9}>
            <TitledSectionCard className={className} >
        <Row>
            <Col>
            <h2>Testimonies</h2>
            </Col>
            <Col>
            <SortTestimonyDropDown
                  orderBy={orderBy}
                  setOrderBy={setOrderBy}
                />
            </Col>
        </Row>
       
        {publishedTestimonies
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
              />
            ))}
      </TitledSectionCard>
      <TitledSectionCard className={className}>
        <h2>Draft Testimonies</h2>
      </TitledSectionCard>
            </Col>
            <Col>
            <TitledSectionCard className={className}>
                <Col>
                </Col>
            </TitledSectionCard>

            </Col>
        </Row>
      
    </div>
  )
}
