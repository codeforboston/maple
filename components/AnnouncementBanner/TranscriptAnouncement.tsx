import AnouncementBanner from "./AnouncementBanner.tsx"

function TranscriptAnouncement() {
  return (
    <AnouncementBanner endDate={new Date("2026-03-01T12:00:00.000Z")}>
      <p className="mb-0">
        <span className="fw-bold">New on MAPLE:</span>{" "}
        <span>
          Looking to learn about the latest action in a committee?
          <br />
          MAPLE now has searchable transcripts for all legislative hearings. {}
          <a href={"/hearings"} style={{ color: "white" }}>
            Try it out!
          </a>
        </span>
      </p>
    </AnouncementBanner>
  )
}

export default TranscriptAnouncement
