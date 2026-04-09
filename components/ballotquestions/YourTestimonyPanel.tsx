import { BallotQuestion, Bill } from "../db"
import { TestimonyFormPanel } from "../publish/panel/TestimonyFormPanel"
import { EditTestimonyButton } from "../publish/panel/EditTestimonyButton"
import Link from "next/link"
import {
  isActiveBallotQuestionPhase,
  isTerminalBallotQuestionPhase
} from "./status"
import { usePanelStatus, usePublishState } from "../publish/hooks"

export const YourTestimonyPanel = ({
  ballotQuestion,
  bill
}: {
  ballotQuestion: BallotQuestion
  bill: Bill | null
}) => {
  const isExpectedOnBallotPhase =
    ballotQuestion.ballotStatus === "expectedOnBallot"
  const isActivePhase = isActiveBallotQuestionPhase(ballotQuestion.ballotStatus)
  const isTerminalPhase = isTerminalBallotQuestionPhase(
    ballotQuestion.ballotStatus
  )
  const panelStatus = usePanelStatus()
  const { bill: resolvedBill, ballotQuestionId: resolvedBallotQuestionId } =
    usePublishState()
  const showInlineEditButton =
    isActivePhase &&
    !!bill &&
    resolvedBill?.id === bill.id &&
    resolvedBallotQuestionId === ballotQuestion.id &&
    (panelStatus === "published" || panelStatus === "editInProgress")

  return (
    <div className="h-100">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div
          className="fw-semibold text-secondary"
          style={{ letterSpacing: "0.01em", fontSize: "1.45rem" }}
        >
          Your Perspective
        </div>
        {showInlineEditButton && bill ? (
          <EditTestimonyButton
            billId={bill.id}
            court={bill.court}
            ballotQuestionId={ballotQuestion.id}
          />
        ) : null}
      </div>
      {isExpectedOnBallotPhase && bill ? (
        <div>
          <div
            className="rounded border px-3 py-3 small text-body-secondary mb-3"
            style={{
              backgroundColor: "var(--bs-blue-100)",
              borderColor: "var(--bs-blue-300)"
            }}
          >
            This question is expected on the ballot. Submit testimony on the
            related bill for this phase.
          </div>
          <Link
            href={`/bills/${bill.court}/${bill.id}`}
            className="btn btn-primary w-100 py-2 small fw-semibold"
          >
            Testify on the bill
          </Link>
        </div>
      ) : isActivePhase && bill ? (
        <>
          <TestimonyFormPanel
            bill={bill}
            ballotQuestionId={ballotQuestion.id}
            variant="ballotQuestion"
          />
        </>
      ) : isTerminalPhase ? (
        <div
          className="rounded border px-3 py-3 small text-body-secondary"
          style={{
            backgroundColor: "var(--bs-blue-100)",
            borderColor: "var(--bs-blue-300)"
          }}
        >
          Perspectives are no longer being accepted for this ballot question.
        </div>
      ) : (
        <div
          className="rounded border px-3 py-3 small text-body-secondary"
          style={{
            backgroundColor: "var(--bs-blue-100)",
            borderColor: "var(--bs-blue-300)"
          }}
        >
          Perspectives are not available for this ballot question yet.
        </div>
      )}
    </div>
  )
}
