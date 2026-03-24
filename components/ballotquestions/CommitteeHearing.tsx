import { DateTime } from "luxon"
import { Hearing } from "./types"

export const CommitteeHearing = ({ hearing }: { hearing: Hearing }) => {
  const startsAt = new Date(hearing.content.startsAt)
  const now = new Date()
  const isOccurred = startsAt < now
  const status = isOccurred ? "Occurred" : "Scheduled"

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
      {hearing.videoURL && (
        <a
          href={hearing.videoURL}
          target="_blank"
          rel="noopener noreferrer"
          className="fw-semibold text-decoration-none"
        >
          Watch the committee hearing here.
        </a>
      )}
    </div>
  )
}
