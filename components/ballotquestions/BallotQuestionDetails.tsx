import { useState } from "react"
import { Container, Row, Col } from "react-bootstrap"
import {
  BallotQuestion,
  Bill,
  usePublishedTestimonyListing
} from "../db"
import { BallotQuestionHeader } from "./BallotQuestionHeader"
import { BallotQuestionNav } from "./BallotQuestionNav"
import { OverviewTab } from "./OverviewTab"
import { TestimoniesTab } from "./TestimoniesTab"

type Hearing = {
  id: string
  videoURL?: string
  content: {
    startsAt: string | number | Date
  }
}

type Tab =
  | "overview"
  | "testimonies"
  | "synthesis"
  | "for_against"
  | "news"
  | "academia"
  | "financials"
  | "map"

export const BallotQuestionDetails = ({
  ballotQuestion,
  bill,
  hearings
}: {
  ballotQuestion: BallotQuestion
  bill: Bill | null
  hearings: Hearing[]
}) => {
  const [activeTab, setActiveTab] = useState<Tab>("overview")
  const testimony = usePublishedTestimonyListing({
    ballotQuestionId: ballotQuestion.id
  })
  const testimonyCount = testimony.items.result?.length ?? 0

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <OverviewTab
            ballotQuestion={ballotQuestion}
            bill={bill}
            hearings={hearings}
          />
        )
      case "testimonies":
        return (
          <TestimoniesTab
            ballotQuestion={ballotQuestion}
            bill={bill}
            testimony={testimony}
          />
        )
      default:
        return null
    }
  }

  return (
    <>
      <BallotQuestionHeader ballotQuestion={ballotQuestion} bill={bill} />
      <Container className="my-4 pb-5" style={{ maxWidth: "1080px" }}>
        <Row className="g-4 align-items-start">
          <Col lg={3} md={4} className="mb-4">
            <BallotQuestionNav
              activeTab={activeTab}
              onTabChange={setActiveTab}
              testimonyCount={testimonyCount}
            />
          </Col>
          <Col lg={9} md={8}>{renderContent()}</Col>
        </Row>
      </Container>
    </>
  )
}
