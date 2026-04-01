import { Internal } from "components/links"
import { DateTime } from "luxon"
import { Hearing } from "./types"

export const CommitteeHearing = ({
  hearing,
  ballotQuestionNumber
}: {
  hearing: Hearing
  ballotQuestionNumber?: number | null
}) => {
  const startsAt = new Date(hearing.startsAt)
  const now = new Date()
  const isOccurred = startsAt < now
  const status = isOccurred ? "Occurred" : "Scheduled"
  const hearingId = hearing.id.replace(/^hearing-/, "")
  const dateBadge = DateTime.fromJSDate(startsAt).toFormat("MMM d")

  const dateStr = DateTime.fromJSDate(startsAt).toLocaleString({
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  })

  return (
    <div
      className="rounded-4 border p-3 p-lg-4"
      style={{
        backgroundColor: "white",
        borderColor: "rgba(15, 23, 42, 0.08)"
      }}
    >
      <div className="d-flex flex-wrap align-items-start justify-content-between gap-3">
        <div className="d-flex gap-3 align-items-start">
          <div
            className="rounded-4 border px-3 py-2 text-center flex-shrink-0"
            style={{
              minWidth: "4.75rem",
              backgroundColor: "rgba(94, 114, 228, 0.06)",
              borderColor: "rgba(94, 114, 228, 0.18)"
            }}
          >
            <div
              className="text-uppercase fw-semibold"
              style={{
                fontSize: "0.72rem",
                letterSpacing: "0.08em",
                color: "#64748b"
              }}
            >
              Hearing
            </div>
            <div className="fw-semibold text-secondary">{dateBadge}</div>
          </div>

          <div>
            <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
              <span
                className="badge rounded-pill px-3 py-2"
                style={{
                  backgroundColor: isOccurred
                    ? "rgba(15, 23, 42, 0.08)"
                    : "rgba(94, 114, 228, 0.12)",
                  color: isOccurred ? "#475569" : "var(--bs-secondary)",
                  fontWeight: 700
                }}
              >
                {status}
              </span>
            </div>
            <div className="fw-semibold mb-1 text-dark">Committee hearing</div>
            <div className="small text-body-secondary">{dateStr}</div>
          </div>
        </div>

        {hearingId ? (
          <div
            className="rounded-pill border px-3 py-2"
            style={{
              borderColor: "rgba(94, 114, 228, 0.18)",
              backgroundColor: "rgba(248, 250, 255, 1)"
            }}
          >
            <Internal
              href={`/hearing/${hearingId}`}
              className="d-inline-flex align-items-center gap-2 small fw-semibold text-decoration-none"
            >
              <span>Open hearing page</span>
              <span aria-hidden="true">→</span>
            </Internal>
          </div>
        ) : null}
      </div>

      {ballotQuestionNumber != null && (
        <p className="small text-body-secondary mb-0 mt-3">
          Review the committee hearing tied to Question {ballotQuestionNumber}.
        </p>
      )}
    </div>
  )
}
