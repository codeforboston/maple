import { Internal } from "components/links"
import { DateTime } from "luxon"
import Image from "next/image"
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
      <div className="d-flex flex-column flex-xl-row align-items-xl-start justify-content-between gap-4 gap-xl-4">
        <div className="d-flex gap-4 align-items-start flex-grow-1">
          <div
            className="rounded-4 border p-3 d-flex align-items-center justify-content-center flex-shrink-0"
            style={{
              width: "5rem",
              height: "5rem",
              backgroundColor: "rgba(94, 114, 228, 0.06)",
              borderColor: "rgba(94, 114, 228, 0.18)"
            }}
          >
            <Image
              src="/speaker-podium.svg"
              alt="Committee hearing"
              width={40}
              height={40}
            />
          </div>

          <div className="flex-grow-1">
            <div className="fw-semibold mb-3 text-dark">Committee Hearing</div>
            <div className="small text-body-secondary lh-lg mb-3">
              Committee hearings are public meetings where legislators reviewed
              the proposed ballot question, asked questions, and heard
              testimony from the public and experts. At this stage, the
              Legislature had the opportunity to pass the proposal into law
              instead of sending it to voters.
            </div>
            <div className="small text-body-secondary">{dateStr}</div>
          </div>
        </div>

        {hearingId ? (
          <Internal
            href={`/hearing/${hearingId}`}
            className="d-inline-flex align-items-center justify-content-center gap-2 rounded-pill border px-3 py-2 px-lg-4 align-self-start small fw-semibold text-decoration-none flex-shrink-0"
            style={{
              borderColor: "rgba(94, 114, 228, 0.18)",
              backgroundColor: "rgba(248, 250, 255, 1)",
              color: "var(--bs-secondary)",
              minHeight: "3.25rem",
              whiteSpace: "nowrap"
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
