import type { ReactNode } from "react"
import { Col, Row } from "react-bootstrap"
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
  const sectionCopyStyle = {
    color: "#334155",
    fontSize: "0.98rem",
    lineHeight: 1.8,
    maxWidth: "75ch"
  } as const

  return (
    <div className="d-grid gap-4">
      <SectionCard>
        <div className="d-flex align-items-start gap-3 mb-0">
          <div
            className="rounded-4 border d-flex align-items-center justify-content-center flex-shrink-0"
            style={{
              width: "3rem",
              height: "3rem",
              borderColor: "rgba(94, 114, 228, 0.16)",
              background:
                "linear-gradient(180deg, rgba(94, 114, 228, 0.16) 0%, rgba(226, 232, 240, 0.55) 100%)"
            }}
          >
            <BallotGlyph />
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
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {ballotQuestion.fullSummary.split(/\n\n+/).map((para, i) => (
              <p key={i} className="small lh-lg mb-0" style={{ ...sectionCopyStyle, whiteSpace: "pre-wrap" }}>
                {para}
              </p>
            ))}
          </div>
        </SectionCard>
      )}

      {bill && sortedHearings.length > 0 && (
        <SectionCard>
          <h3 className="h5 mb-2 text-dark">Committee Hearing</h3>
          <p className="mb-4" style={sectionCopyStyle}>
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
        </SectionCard>
      )}
    </div>
  )
}

function BallotGlyph() {
  return (
    <svg
      aria-hidden="true"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      style={{
        display: "block",
        transform: "translateY(-1px)"
      }}
    >
      <path
        d="M8 4.75H14.4L18.25 8.6V17.75C18.25 18.9926 17.2426 20 16 20H8C6.75736 20 5.75 18.9926 5.75 17.75V7C5.75 5.75736 6.75736 4.75 8 4.75Z"
        fill="rgba(255, 255, 255, 0.94)"
        stroke="rgba(50, 73, 179, 0.24)"
        strokeWidth="1.5"
      />
      <path
        d="M14.25 4.75V7.85C14.25 8.49015 14.7598 9 15.4 9H18.25"
        stroke="rgba(50, 73, 179, 0.24)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect
        x="8.3"
        y="10.1"
        width="2.7"
        height="2.7"
        rx="0.7"
        fill="rgba(94, 114, 228, 0.14)"
        stroke="#3249b3"
        strokeWidth="1.2"
      />
      <path
        d="M9.1 11.45L9.8 12.15L10.95 10.95"
        stroke="#3249b3"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12.6 10.9H15.95"
        stroke="#3249b3"
        strokeWidth="1.35"
        strokeLinecap="round"
      />
      <path
        d="M8.3 15.2H15.95"
        stroke="#94A3B8"
        strokeWidth="1.35"
        strokeLinecap="round"
      />
    </svg>
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
