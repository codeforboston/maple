import { useTranslation } from "next-i18next"
import { Internal } from "components/links"
import { useCalendarEvents } from "components/HearingsScheduled/calendarEvents"
import styles from "./Homepage.module.css"

export type HomepageHearingEvent = {
  type: "hearing"
  id: number
  name: string
  location?: string
  month: string
  date: string
}

function eventUrl(type: "hearing" | "session", id: number) {
  if (type === "hearing") {
    return `https://malegislature.gov/Events/Hearings/Detail/${id}`
  }

  return `https://malegislature.gov/Events/Sessions/Detail/${id}`
}

export function HearingsSectionContent({
  loading,
  upcomingHearings
}: {
  loading: boolean
  upcomingHearings: HomepageHearingEvent[]
}) {
  const { t } = useTranslation("homepage")

  return (
    <section className={styles.hearingsBand}>
      <div
        className={`${styles.sectionShell} ${styles.hearings}`}
        aria-labelledby="homepage-upcoming-hearings"
      >
        <div className={styles.hearingsHeader}>
          <h2 id="homepage-upcoming-hearings" className={styles.hearingsTitle}>
            {t("hearings.title")}
          </h2>
          <Internal href="/hearings" className={styles.hearingsActionDesktop}>
            {t("hearings.action")}
          </Internal>
        </div>
        {loading ? (
          <p className={styles.hearingsEmpty}>{t("hearings.loading")}</p>
        ) : upcomingHearings.length ? (
          <div className={styles.hearingGrid}>
            {upcomingHearings.map(event => (
              <article
                key={`${event.type}-${event.id}`}
                className={styles.hearingCard}
              >
                <div className={styles.hearingDate}>
                  <div className={styles.hearingMonth}>{event.month}</div>
                  <div className={styles.hearingDay}>{event.date}</div>
                </div>
                <div className={styles.hearingBody}>
                  {event.location ? (
                    <div className={styles.hearingMeta}>{event.location}</div>
                  ) : null}
                  <a
                    href={eventUrl(event.type, event.id)}
                    className={styles.hearingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {event.name}
                  </a>
                  <p className={styles.hearingTopic}>{t("hearings.topic")}</p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className={styles.hearingsEmpty}>
            {t("hearingsScheduled.noEvents")}
          </p>
        )}
        <Internal href="/hearings" className={styles.hearingsActionMobile}>
          {t("hearings.action")}
        </Internal>
      </div>
    </section>
  )
}

export default function HearingsSection() {
  const { loading, eventList } = useCalendarEvents()

  const upcomingHearings: HomepageHearingEvent[] = eventList
    .filter(
      (event): event is typeof event & { type: "hearing" } =>
        event.type === "hearing"
    )
    .slice(0, 4)
    .map(({ type, id, name, location, month, date }) => ({
      type,
      id,
      name,
      location,
      month,
      date
    }))

  return (
    <HearingsSectionContent
      loading={loading}
      upcomingHearings={upcomingHearings}
    />
  )
}
