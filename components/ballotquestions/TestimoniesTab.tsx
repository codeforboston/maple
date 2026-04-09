import { Image } from "react-bootstrap"
import ViewTestimony from "../TestimonyCard/ViewTestimony"
import { BallotQuestion, Bill, UsePublishedTestimonyListing } from "../db"
import { isActiveBallotQuestionPhase } from "./status"
import { BallotQuestionTestimonySummary } from "./types"

export const TestimoniesTab = ({
  ballotQuestion,
  testimony,
  testimonySummary
}: {
  ballotQuestion: BallotQuestion
  bill: Bill | null
  testimony: UsePublishedTestimonyListing
  testimonySummary: BallotQuestionTestimonySummary
}) => {
  const allowEdit = isActiveBallotQuestionPhase(ballotQuestion.ballotStatus)
  const totalLabel =
    testimonySummary.testimonyCount === 1
      ? "1 perspective"
      : `${testimonySummary.testimonyCount} perspectives`

  return (
    <div className="d-grid gap-4">
      <div
        className="rounded-4 border bg-white p-4 shadow-sm"
        style={{
          borderColor: "rgba(15, 23, 42, 0.08)",
          boxShadow: "0 0.5rem 1.5rem rgba(15, 23, 42, 0.06)"
        }}
      >
        <div className="d-flex flex-wrap justify-content-between gap-3 mb-4">
          <div className="d-flex align-items-start gap-3">
            <div
              className="rounded-4 border d-flex align-items-center justify-content-center flex-shrink-0"
              style={{
                width: "2.75rem",
                height: "2.75rem",
                borderColor: "rgba(94, 114, 228, 0.18)",
                backgroundColor: "rgba(94, 114, 228, 0.08)"
              }}
            >
              <Image src="/bill-thank-you.svg" alt="" width={22} height={18} />
            </div>
            <div>
              <h2 className="h4 mb-1 text-secondary">Perspectives</h2>
              <p className="text-body-secondary small mb-0">{totalLabel}</p>
            </div>
          </div>
        </div>

        <div
          className="border-top pt-4"
          style={{ borderColor: "rgba(15, 23, 42, 0.08)" }}
        >
          <div className="row g-3">
            <div className="col-md-4">
              <SummaryItem
                label="Endorse"
                count={testimonySummary.endorseCount}
                icon="/thumbs-endorse.svg"
                color="var(--bs-green)"
              />
            </div>
            <div className="col-md-4">
              <SummaryItem
                label="Neutral"
                count={testimonySummary.neutralCount}
                icon="/thumbs-neutral.svg"
                color="var(--bs-blue)"
              />
            </div>
            <div className="col-md-4">
              <SummaryItem
                label="Oppose"
                count={testimonySummary.opposeCount}
                icon="/thumbs-oppose.svg"
                color="var(--bs-orange)"
              />
            </div>
          </div>
        </div>
      </div>

      <ViewTestimony
        {...testimony}
        onProfilePage={false}
        variant="ballotQuestion"
        allowEdit={allowEdit}
        totalTestimonies={testimonySummary.testimonyCount}
      />
    </div>
  )
}

function SummaryItem({
  label,
  count,
  icon,
  color
}: {
  label: string
  count: number
  icon: string
  color: string
}) {
  return (
    <div
      className="rounded-4 border h-100 px-3 py-3"
      style={{
        backgroundColor: "rgba(248, 250, 252, 0.9)",
        borderColor: "rgba(15, 23, 42, 0.08)"
      }}
    >
      <div className="d-flex align-items-center justify-content-between gap-3">
        <div>
          <div
            className="text-uppercase fw-semibold mb-1"
            style={{
              fontSize: "0.72rem",
              letterSpacing: "0.08em",
              color: "#64748b"
            }}
          >
            {label}
          </div>
          <div
            className="fw-semibold"
            style={{ color, fontSize: "1.75rem", lineHeight: 1 }}
          >
            {count}
          </div>
        </div>
        <div
          className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
          style={{
            width: "2.5rem",
            height: "2.5rem",
            backgroundColor: "white",
            border: "1px solid rgba(15, 23, 42, 0.08)"
          }}
        >
          <Image src={icon} alt="" width={18} height={18} />
        </div>
      </div>
    </div>
  )
}
