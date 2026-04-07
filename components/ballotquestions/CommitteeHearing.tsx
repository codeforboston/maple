import { Internal } from "components/links"
import { DateTime } from "luxon"
import { Hearing } from "./types"

export const CommitteeHearing = ({ hearing }: { hearing: Hearing }) => {
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
      <div className="d-flex flex-column flex-xl-row align-items-xl-center justify-content-between gap-3 gap-xl-4">
        <div className="d-flex gap-3 align-items-start flex-grow-1">
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

          <div className="flex-grow-1">
            <div style={{ minWidth: "16rem" }}>
              <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                <span
                  className="d-inline-flex align-items-center gap-2 fw-semibold"
                  style={{
                    color: isOccurred ? "#475569" : "var(--bs-secondary)",
                    fontSize: "0.92rem",
                    lineHeight: 1.2
                  }}
                >
                  <span
                    aria-hidden="true"
                    style={{
                      width: "0.55rem",
                      height: "0.55rem",
                      borderRadius: "999px",
                      backgroundColor: isOccurred
                        ? "rgba(15, 23, 42, 0.45)"
                        : "var(--bs-secondary)",
                      boxShadow: isOccurred
                        ? "0 0 0 4px rgba(15, 23, 42, 0.08)"
                        : "0 0 0 4px rgba(94, 114, 228, 0.12)"
                    }}
                  />
                  {status}
                </span>
              </div>
              <div className="fw-semibold mb-1 text-dark">
                Committee hearing
              </div>
              <div className="small text-body-secondary">{dateStr}</div>
            </div>
          </div>
        </div>

        {hearingId ? (
          <Internal
            href={`/hearing/${hearingId}`}
            className="d-inline-flex align-items-center justify-content-center gap-2 rounded-pill border px-3 py-2 px-lg-4 align-self-start align-self-xl-center small fw-semibold text-decoration-none flex-shrink-0"
            style={{
              borderColor: "rgba(94, 114, 228, 0.18)",
              backgroundColor: "rgba(248, 250, 255, 1)",
              color: "var(--bs-secondary)",
              minHeight: "3.25rem"
            }}
          >
            <span>Open hearing page</span>
            <span aria-hidden="true">→</span>
          </Internal>
        ) : null}
      </div>
    </div>
  )
}
