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

  const dateStr = DateTime.fromJSDate(startsAt).toLocaleString({
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  })

  return (
    <div className="small">
      <ul className="mb-2 ps-3">
        <li>
          <strong>Status:</strong> {status}
        </li>
        <li>
          <strong>Date:</strong> {dateStr}
        </li>
      </ul>
      {hearingId ? (
        <Internal
          href={`/hearing/${hearingId}`}
          className="fw-semibold text-decoration-none"
        >
          Watch the committee hearing
          {ballotQuestionNumber != null
            ? ` for Question ${ballotQuestionNumber}`
            : ""}
          {" here."}
        </Internal>
      ) : null}
    </div>
  )
}
