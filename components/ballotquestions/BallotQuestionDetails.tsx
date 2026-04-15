import { useState } from "react"
import { Container, Row, Col } from "react-bootstrap"
import { BallotQuestion, Bill, usePublishedTestimonyListing } from "../db"
import { BallotQuestionHeader } from "./BallotQuestionHeader"
import { BallotQuestionNav } from "./BallotQuestionNav"
import { OverviewTab } from "./OverviewTab"
import { TestimoniesTab } from "./TestimoniesTab"
import {
  BallotQuestionTab,
  BallotQuestionTestimonySummary,
  Hearing,
  getBallotQuestionPanelId,
  getBallotQuestionTabId
} from "./types"

export const BallotQuestionDetails = ({
  ballotQuestion,
  bill,
  hearings,
  testimonySummary
}: {
  ballotQuestion: BallotQuestion
  bill: Bill | null
  hearings: Hearing[]
  testimonySummary: BallotQuestionTestimonySummary
}) => {
  const [activeTab, setActiveTab] = useState<BallotQuestionTab>("overview")
  const testimony = usePublishedTestimonyListing({
    ballotQuestionId: ballotQuestion.id
  })

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
            testimonySummary={testimonySummary}
          />
        )
      default:
        return null
    }
  }

  return (
    <>
      <BallotQuestionHeader ballotQuestion={ballotQuestion} bill={bill} />
      <Container fluid="xl" className="my-4 pb-5">
        <Row className="g-4 align-items-start">
          <Col lg={3} md={4} className="mb-4">
            <BallotQuestionNav
              activeTab={activeTab}
              onTabChange={setActiveTab}
              testimonyCount={testimonySummary.testimonyCount}
            />
          </Col>
          <Col lg={9} md={8}>
            <div
              role="tabpanel"
              id={getBallotQuestionPanelId(activeTab)}
              aria-labelledby={getBallotQuestionTabId(activeTab)}
            >
              {renderContent()}
            </div>
          </Col>
        </Row>
      </Container>
    </>
  )
}
