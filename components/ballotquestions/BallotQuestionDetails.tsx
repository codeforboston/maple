import { useState, useEffect, useRef, useCallback } from "react"
import { Container, Row, Col } from "react-bootstrap"
import { BallotQuestion, Bill, usePublishedTestimonyListing } from "../db"
import { BallotQuestionHeader } from "./BallotQuestionHeader"
import { BallotQuestionNav } from "./BallotQuestionNav"
import { OverviewTab } from "./OverviewTab"
import { TestimoniesTab } from "./TestimoniesTab"
import { ForAndAgainstTab } from "./ForAndAgainstTab"
import { CampaignFinancialsTab } from "./CampaignFinancialsTab"
import {
  BallotQuestionTab,
  BallotQuestionTestimonySummary,
  Hearing,
  getBallotQuestionPanelId,
  getBallotQuestionTabId
} from "./types"
import { usePanelStatus, usePublishState } from "../publish/hooks"
import { firestore } from "../firebase"
import { doc, getDoc } from "firebase/firestore"

interface CountDelta {
  testimonyCount: number
  endorseCount: number
  neutralCount: number
  opposeCount: number
}

const zeroCountDelta = (): CountDelta => ({
  testimonyCount: 0,
  endorseCount: 0,
  neutralCount: 0,
  opposeCount: 0
})

const addCountDeltas = (left: CountDelta, right: CountDelta): CountDelta => ({
  testimonyCount: left.testimonyCount + right.testimonyCount,
  endorseCount: left.endorseCount + right.endorseCount,
  neutralCount: left.neutralCount + right.neutralCount,
  opposeCount: left.opposeCount + right.opposeCount
})

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

  const [countDelta, setCountDelta] = useState<CountDelta>(zeroCountDelta)

  // Track publish lifecycle
  const panelStatus = usePanelStatus()
  const { publication } = usePublishState()
  const wasInProgressRef = useRef(false)
  const capturedOldPositionRef = useRef<string | undefined>(undefined)
  const isMountedRef = useRef(true)

  // Track when user enters a submit action
  useEffect(() => {
    if (
      panelStatus === "createInProgress" ||
      panelStatus === "editInProgress"
    ) {
      wasInProgressRef.current = true
    }
  }, [panelStatus])

  // Capture old position while in editInProgress (before syncTestimony overwrites it)
  useEffect(() => {
    if (panelStatus === "editInProgress") {
      capturedOldPositionRef.current = publication?.position
    } else if (panelStatus === "createInProgress") {
      capturedOldPositionRef.current = undefined
    }
  }, [panelStatus, publication])

  // Reconciliation: fetch fresh ballot question doc
  const reconcileBallotQuestionCounters = useCallback(
    async (expectedSummary: BallotQuestionTestimonySummary) => {
      const maxRetries = 3
      const delayMs = 500

      for (let attempt = 0; attempt < maxRetries; attempt++) {
        if (!isMountedRef.current) return

        try {
          const ballotQuestionRef = doc(
            firestore,
            "ballotQuestions",
            ballotQuestion.id
          )
          const freshBQ = await getDoc(ballotQuestionRef)
          const freshData = freshBQ.data() as BallotQuestion | undefined

          if (freshData && isMountedRef.current) {
            // Compare all four counters
            const countersMatch =
              (freshData.testimonyCount ?? 0) ===
                expectedSummary.testimonyCount &&
              (freshData.endorseCount ?? 0) === expectedSummary.endorseCount &&
              (freshData.neutralCount ?? 0) === expectedSummary.neutralCount &&
              (freshData.opposeCount ?? 0) === expectedSummary.opposeCount

            if (countersMatch) {
              // Counters have caught up; clear the delta
              setCountDelta(zeroCountDelta())
              capturedOldPositionRef.current = undefined
              return
            }
          }
        } catch (err) {
          console.error("Error fetching ballot question counters:", err)
        }

        // If counters don't match yet, wait and retry
        if (attempt < maxRetries - 1 && isMountedRef.current) {
          await new Promise(resolve => setTimeout(resolve, delayMs))
        }
      }

      // After retries exhausted, leave delta applied; user will see eventual consistency
      console.warn("Ballot question counters did not reconcile after retries")
    },
    [ballotQuestion.id]
  )

  // Detect successful publish and apply delta
  useEffect(() => {
    if (panelStatus === "published" && wasInProgressRef.current) {
      wasInProgressRef.current = false

      const delta: CountDelta = zeroCountDelta()

      const oldPosition = capturedOldPositionRef.current
      const newPosition = publication?.position

      if (!oldPosition && newPosition) {
        // New submission
        delta.testimonyCount = 1
        delta[`${newPosition}Count` as keyof CountDelta] = 1
      } else if (oldPosition && newPosition && oldPosition !== newPosition) {
        // Edit with position change
        delta[`${oldPosition}Count` as keyof CountDelta] = -1
        delta[`${newPosition}Count` as keyof CountDelta] = 1
      }
      // else: edit without position change, or no publication — no delta

      const nextDelta = addCountDeltas(countDelta, delta)
      setCountDelta(nextDelta)
      capturedOldPositionRef.current = undefined

      // Compute expected final summary and pass to reconciliation
      const expectedSummary = {
        testimonyCount:
          testimonySummary.testimonyCount + nextDelta.testimonyCount,
        endorseCount: testimonySummary.endorseCount + nextDelta.endorseCount,
        neutralCount: testimonySummary.neutralCount + nextDelta.neutralCount,
        opposeCount: testimonySummary.opposeCount + nextDelta.opposeCount
      }
      reconcileBallotQuestionCounters(expectedSummary)
    }
  }, [
    countDelta,
    panelStatus,
    publication,
    reconcileBallotQuestionCounters,
    testimonySummary
  ])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false
    }
  }, [])

  // Display summary with optimistic delta applied
  const displayedSummary = {
    testimonyCount: testimonySummary.testimonyCount + countDelta.testimonyCount,
    endorseCount: testimonySummary.endorseCount + countDelta.endorseCount,
    neutralCount: testimonySummary.neutralCount + countDelta.neutralCount,
    opposeCount: testimonySummary.opposeCount + countDelta.opposeCount
  }
  const showCampaignFinancials = true
  const showForAndAgainst = true

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
            testimonySummary={displayedSummary}
          />
        )
      case "for_against":
        return <ForAndAgainstTab ballotQuestion={ballotQuestion} />
      case "financials":
        return <CampaignFinancialsTab ballotQuestion={ballotQuestion} />
      default:
        return null
    }
  }

  return (
    <>
      <BallotQuestionHeader ballotQuestion={ballotQuestion} bill={bill} />
      <Container fluid="xl" className="my-4 pb-5">
        <Row className="g-4 align-items-start">
          <Col lg={3}>
            <BallotQuestionNav
              activeTab={activeTab}
              onTabChange={setActiveTab}
              testimonyCount={displayedSummary.testimonyCount}
              showCampaignFinancials={showCampaignFinancials}
              showForAndAgainst={showForAndAgainst}
            />
          </Col>
          <Col lg={9}>
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
