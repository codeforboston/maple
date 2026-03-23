import Link from "next/link"
import { Image } from "react-bootstrap"
import ViewTestimony from "../TestimonyCard/ViewTestimony"
import {
  BallotQuestion,
  Bill,
  UsePublishedTestimonyListing
} from "../db"
import { isActiveBallotQuestionPhase } from "./status"

export const TestimoniesTab = ({
  ballotQuestion,
  bill,
  testimony
}: {
  ballotQuestion: BallotQuestion
  bill: Bill | null
  testimony: UsePublishedTestimonyListing
}) => {
  const isLegislaturePhase = ballotQuestion.ballotStatus === "legislature"
  const allowEdit = isActiveBallotQuestionPhase(ballotQuestion.ballotStatus)
  const entries = testimony.items.result ?? []
  const counts = entries.reduce(
    (acc, item) => {
      acc[item.position] += 1
      return acc
    },
    { endorse: 0, neutral: 0, oppose: 0 }
  )

  return (
    <div className="d-grid gap-4">
      <div className="rounded border bg-white p-4 shadow-sm">
        <div className="d-flex flex-wrap justify-content-between gap-3 mb-4">
          <div className="d-flex align-items-start gap-3">
            <div
              className="rounded border d-flex align-items-center justify-content-center flex-shrink-0"
              style={{
                width: "2.5rem",
                height: "2.5rem",
                borderColor: "var(--bs-blue-300)",
                backgroundColor: "var(--bs-blue-100)"
              }}
            >
              <Image
                src="/bill-thank-you.svg"
                alt=""
                width={22}
                height={18}
              />
            </div>
            <div>
              <h2 className="h4 mb-1 text-secondary">
                Testimonies
              </h2>
              <p className="text-body-secondary small mb-0">
                {entries.length} total testimony
              </p>
            </div>
          </div>
        </div>

        <div className="d-flex flex-wrap gap-5 align-items-center border-top pt-3">
          <SummaryItem
            label="Endorse"
            count={counts.endorse}
            icon="/thumbs-endorse.svg"
            color="var(--bs-green)"
          />
          <SummaryItem
            label="Neutral"
            count={counts.neutral}
            icon="/thumbs-neutral.svg"
            color="var(--bs-blue)"
          />
          <SummaryItem
            label="Oppose"
            count={counts.oppose}
            icon="/thumbs-oppose.svg"
            color="var(--bs-orange)"
          />
        </div>

        {isLegislaturePhase && bill && (
          <div className="mt-4 rounded border bg-light p-3 small text-muted">
            Ballot-question testimony is not yet open during the legislature
            stage, so this feed will stay empty until the question advances.
            {" "}
            <Link
              href={`/bills/${bill.court}/${bill.id}`}
              className="fw-semibold text-decoration-none"
            >
              View the related bill to read legislative testimony.
            </Link>
          </div>
        )}
      </div>

      <ViewTestimony
        {...testimony}
        onProfilePage={false}
        variant="ballotQuestion"
        allowEdit={allowEdit}
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
    <div className="d-flex align-items-center gap-2 small">
      <Image src={icon} alt="" width={18} height={18} />
      <div className="fw-semibold" style={{ color }}>
        {count}
      </div>
      <div className="text-muted">{label}</div>
    </div>
  )
}
