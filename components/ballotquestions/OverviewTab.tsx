import Link from "next/link"
import { Image } from "react-bootstrap"
import { BallotQuestion, Bill } from "../db"
import { CommitteeHearing } from "./CommitteeHearing"
import { Hearing } from "./types"

export const OverviewTab = ({
  ballotQuestion,
  bill,
  hearings
}: {
  ballotQuestion: BallotQuestion
  bill: Bill | null
  hearings: Hearing[]
}) => {
  const sortedHearings = [...hearings].sort(
    (a, b) =>
      new Date(b.content.startsAt).getTime() - new Date(a.content.startsAt).getTime()
  )

  return (
    <div className="rounded border bg-white px-4 py-4 shadow-sm">
      <div className="d-flex align-items-start gap-3 mb-4">
        <div
          className="rounded border d-flex align-items-center justify-content-center flex-shrink-0"
          style={{
            width: "2.5rem",
            height: "2.5rem",
            borderColor: "var(--bs-blue-300)",
            backgroundColor: "var(--bs-blue-100)"
          }}
        >
          <Image src="/speaker-with-thumbs.svg" alt="" width={22} height={22} />
        </div>
        <div>
          <h2 className="h4 mb-1 text-secondary">
            Overview
          </h2>
          <p className="text-body-secondary small mb-0">
            The ballot question at a high-level.
          </p>
          {bill && (
            <Link
              href={`/bills/${bill.court}/${bill.id}`}
              className="d-inline-block mt-3 small fw-semibold text-decoration-none text-secondary"
            >
              View complete text
            </Link>
          )}
        </div>
      </div>

      {ballotQuestion.atAGlance && ballotQuestion.atAGlance.length > 0 && (
        <section className="mb-4">
          <h3 className="h6 fw-semibold mb-3">Key Details</h3>
          <div
            className="rounded border px-3 py-3"
            style={{
              backgroundColor: "var(--bs-blue-100)",
              borderColor: "var(--bs-blue-300)"
            }}
          >
            <div className="small fw-semibold mb-2">At a glance:</div>
            <ul className="mb-0 ps-3 small">
              {ballotQuestion.atAGlance.map(
                (item: { label: string; value: string }, idx: number) => (
                  <li key={idx}>
                    <strong>{item.label}:</strong> {item.value}
                  </li>
                )
              )}
            </ul>
          </div>
        </section>
      )}

      {ballotQuestion.fullSummary && (
        <section className="mb-4">
          <h3 className="h6 fw-semibold mb-3">Final Summary</h3>
          <p className="small lh-lg mb-0" style={{ whiteSpace: "pre-wrap" }}>{ballotQuestion.fullSummary}</p>
        </section>
      )}

      {bill && sortedHearings.length > 0 && (
        <section>
          <h3 className="h6 fw-semibold mb-3">Committee Hearing</h3>
          <p className="small text-body-secondary mb-3">
            Committee hearings are public meetings where legislators examine a
            proposed law, ask questions, and hear testimony from the public and
            experts. What happens at a hearing can influence whether a proposal
            moves forward, is revised, or does not advance.
          </p>
          <div className="d-grid gap-3">
            {sortedHearings.map(hearing => (
              <CommitteeHearing key={hearing.id} hearing={hearing} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
