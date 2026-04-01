import type { ReactNode } from "react"
import { Col, Image, Row } from "react-bootstrap"
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
  const sortedHearings = [...hearings].sort((a, b) => b.startsAt - a.startsAt)

  return (
    <div className="d-grid gap-4">
      <SectionCard>
        <div className="d-flex align-items-start gap-3 mb-0">
          <div
            className="rounded-4 border d-flex align-items-center justify-content-center flex-shrink-0"
            style={{
              width: "2.75rem",
              height: "2.75rem",
              borderColor: "rgba(94, 114, 228, 0.18)",
              backgroundColor: "rgba(94, 114, 228, 0.08)"
            }}
          >
            <Image
              src="/speaker-with-thumbs.svg"
              alt=""
              width={22}
              height={22}
            />
          </div>
          <div>
            <h2 className="h4 mb-1 text-secondary">Overview</h2>
            <p className="text-body-secondary small mb-0">
              Understand the question, key details, and legislature-phase
              context in one place.
            </p>
          </div>
        </div>
      </SectionCard>

      {ballotQuestion.atAGlance && ballotQuestion.atAGlance.length > 0 && (
        <SectionCard>
          <h3 className="h5 mb-3 text-dark">Key Details</h3>
          <Row className="g-3">
            {ballotQuestion.atAGlance.map((item, idx) => (
              <Col key={idx} md={6}>
                <div
                  className="rounded-4 border h-100 px-3 py-3"
                  style={{
                    backgroundColor: "rgba(248, 250, 252, 0.9)",
                    borderColor: "rgba(15, 23, 42, 0.08)"
                  }}
                >
                  <div
                    className="text-uppercase fw-semibold mb-2"
                    style={{
                      fontSize: "0.72rem",
                      letterSpacing: "0.08em",
                      color: "#64748b"
                    }}
                  >
                    {item.label}
                  </div>
                  <div
                    style={{
                      color: "#1e293b",
                      fontSize: "0.98rem",
                      lineHeight: 1.5
                    }}
                  >
                    {item.value}
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </SectionCard>
      )}

      {ballotQuestion.fullSummary && (
        <SectionCard>
          <h3 className="h5 mb-3 text-dark">Final Summary</h3>
          <p
            className="mb-0"
            style={{
              color: "#334155",
              fontSize: "0.98rem",
              lineHeight: 1.8,
              maxWidth: "68ch",
              whiteSpace: "pre-wrap"
            }}
          >
            {ballotQuestion.fullSummary}
          </p>
        </SectionCard>
      )}

      {bill && sortedHearings.length > 0 && (
        <SectionCard>
          <h3 className="h5 mb-2 text-dark">Committee Hearing</h3>
          <p
            className="small text-body-secondary mb-4"
            style={{ maxWidth: "62ch" }}
          >
            Committee hearings are public meetings where legislators examine a
            proposed law, ask questions, and hear testimony from the public and
            experts. What happens at a hearing can influence whether a proposal
            moves forward, is revised, or does not advance.
          </p>
          <div className="d-grid gap-3">
            {sortedHearings.map(hearing => (
              <CommitteeHearing
                key={hearing.id}
                hearing={hearing}
                ballotQuestionNumber={ballotQuestion.ballotQuestionNumber}
              />
            ))}
          </div>
        </SectionCard>
      )}
    </div>
  )
}

function SectionCard({ children }: { children: ReactNode }) {
  return (
    <section
      className="rounded-4 border bg-white px-4 py-4 shadow-sm"
      style={{
        borderColor: "rgba(15, 23, 42, 0.08)",
        boxShadow: "0 0.5rem 1.5rem rgba(15, 23, 42, 0.06)"
      }}
    >
      {children}
    </section>
  )
}
