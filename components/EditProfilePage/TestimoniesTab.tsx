import { useState } from "react"
import { Col, Row } from "../bootstrap"
import { UsePublishedTestimonyListing } from "../db"
import { TitledSectionCard } from "../shared"
import { TestimonyItem } from "components/TestimonyCard/TestimonyItem"
import { SortTestimonyDropDown } from "components/TestimonyCard/SortTestimonyDropDown"
import { TestimonyFAQ } from "./TestimonyFAQ"
import { Testimony } from "../db"
import { Title } from "react-admin"


export const TestimoniesTab = (
   {publishedTestimonies, draftTestimonies, className} :  {
    publishedTestimonies: Testimony[] | undefined, 
    draftTestimonies: Testimony[] | undefined,
    className: string
   }
) => {

    const [orderBy, setOrderBy] = useState<string>()

    console.log(draftTestimonies)
  return (
    <div className="mb-5">
        <Row>
            <Col xs={8}>
            <TitledSectionCard className={className} >
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
            publishedTestimonies.sort((a, b) =>
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
                isEditing={true}
              />
            ))}
      </TitledSectionCard>
      <TitledSectionCard className={className}>
        <h2>Draft Testimonies</h2>
        {draftTestimonies && 
            draftTestimonies
            .map(t => (
              <TestimonyItem
                key={t.authorUid + t.billId}
                testimony={t}
                isUser={true}
                showBillInfo={true}
                isEditing={true}
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
