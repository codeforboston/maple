import { BallotQuestion, Bill } from "../db"
import { TestimonyFormPanel } from "../publish/panel/TestimonyFormPanel"
import Link from "next/link"
import {
  isActiveBallotQuestionPhase,
  isTerminalBallotQuestionPhase
} from "./status"

export const YourTestimonyPanel = ({
  ballotQuestion,
  bill
}: {
  ballotQuestion: BallotQuestion
  bill: Bill | null
}) => {
  const isLegislaturePhase = ballotQuestion.ballotStatus === "legislature"
  const isActivePhase = isActiveBallotQuestionPhase(ballotQuestion.ballotStatus)
  const isTerminalPhase = isTerminalBallotQuestionPhase(
    ballotQuestion.ballotStatus
  )
  const showSectionTitle = !(isActivePhase && bill)

  return (
    <div className="h-100">
      {showSectionTitle && (
        <div
          className="fw-semibold text-secondary mb-3"
          style={{ letterSpacing: "0.01em", fontSize: "1.45rem" }}
        >
          Your Testimony
        </div>
      )}
      {isLegislaturePhase && bill ? (
        <div>
          <div
            className="rounded border px-3 py-3 small text-body-secondary mb-3"
            style={{
              backgroundColor: "var(--bs-blue-100)",
              borderColor: "var(--bs-blue-300)"
            }}
          >
            This petition is still before the legislature. Submit testimony on
            the related bill for this phase.
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
          Testimony is no longer accepted for this ballot question.
        </div>
      ) : (
        <div
          className="rounded border px-3 py-3 small text-body-secondary"
          style={{
            backgroundColor: "var(--bs-blue-100)",
            borderColor: "var(--bs-blue-300)"
          }}
        >
          Testimony is not available for this ballot question yet.
        </div>
      )}
    </div>
  )
}
