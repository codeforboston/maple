import { useTranslation } from "react-i18next"
import AnnouncementBanner from "./AnnouncementBanner"

function TranscriptAnnouncement() {
  const { t } = useTranslation("common")
  return (
    <AnnouncementBanner endDate={new Date("2026-03-01T12:00:00.000Z")}>
      <p className="mb-0">
        <span className="fw-bold">{t("announcement.headingBold")}</span>{" "}
        <span>
          {t("announcement.headingBody")}
          <br />
          {t("announcement.description")}{" "}
          <a href="/hearings" style={{ color: "white" }}>
            {t("announcement.link")}
          </a>
        </span>
      </p>
    </AnnouncementBanner>
  )
}

export default TranscriptAnnouncement
