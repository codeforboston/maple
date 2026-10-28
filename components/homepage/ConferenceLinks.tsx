import { useTranslation } from "next-i18next"
import { useEffect, useState } from "react"
import { currentGeneralCourt } from "functions/src/shared"
import { BillLine } from "components/conference/ConferenceRail"
import {
  byActivity,
  conferenceName,
  ConferenceSummary
} from "components/conference/types"
import { listConferences } from "components/db/conferences"
import { flags } from "components/featureFlags"
import { Internal, maple } from "components/links"
import styles from "./Homepage.module.css"

export type ConferenceLinksProps = {
  conferences: ConferenceSummary[]
  /** How many to list before the link to the rest. */
  limit?: number
}

/**
 * Conference committees as links to their pages, each with its two bill
 * numbers, for a slot in the hero's search panel. Past the limit, one link to
 * the conferences page stands in for the rest.
 */
export default function ConferenceLinks({
  conferences,
  limit = 6
}: ConferenceLinksProps) {
  const { t } = useTranslation("homepage")
  if (conferences.length === 0) return null

  return (
    <div className={styles.conferenceLinks}>
      <ul className={styles.conferenceList}>
        {conferences.slice(0, limit).map(c => (
          <li key={c.id}>
            <Internal
              href={maple.conference({ court: c.court, id: c.id })}
              className={styles.conferenceLink}
            >
              <span className={styles.conferenceName}>{conferenceName(c)}</span>
              <span className={styles.conferenceBills}>
                <BillLine c={c} />
              </span>
            </Internal>
          </li>
        ))}
      </ul>
      {conferences.length > limit && <ConferencesLink />}
    </div>
  )
}

/**
 * The button to the conference committees page. The list above
 * ends with it. Nothing renders while the conferences flag is off, since the
 * page is off too.
 */
export function ConferencesLink() {
  const { t } = useTranslation("homepage")
  if (!flags().conferences) return null

  return (
    <Internal
      href={maple.conferences()}
      className={`btn btn-primary ${styles.conferenceAction}`}
    >
      {t("conferenceLinks.addInput")}
    </Internal>
  )
}

/** The page of the first conference in the conference page's own order
 * (still sitting first, then by name), or null until it has loaded. */
function useFirstConferenceHref() {
  const [href, setHref] = useState<string | null>(null)
  const enabled = flags().conferences

  useEffect(() => {
    if (!enabled) return
    let cancelled = false
    listConferences(currentGeneralCourt)
      .then(all => {
        const first = all
          .map(c => ({ ...c, name: c.name ?? null }))
          .sort(byActivity)[0]
        if (!cancelled && first) setHref(maple.conference(first))
      })
      .catch(() => {
        // Left on the conferences page.
      })
    return () => {
      cancelled = true
    }
  }, [enabled])

  return href
}

/**
 * The homepage panel's two buttons, the site's own Bootstrap ones. Learn
 * More, outlined, opens the conferences page, which starts on its explainer.
 * Add Your Input, solid, skips that and goes straight to the first committee,
 * whose page lists the others down the side. Until that one has loaded, Add
 * Your Input goes to the conferences page too. Nothing renders while the
 * conferences flag is off.
 */
export function ConferenceActions() {
  const { t } = useTranslation("homepage")
  const firstHref = useFirstConferenceHref()
  if (!flags().conferences) return null

  return (
    <div className={styles.heroActions}>
      <Internal
        href={maple.conferences()}
        className="btn btn-outline-secondary"
      >
        {t("conferenceLinks.learnMore")}
      </Internal>
      <Internal
        href={firstHref ?? maple.conferences()}
        className="btn btn-primary"
      >
        {t("conferenceLinks.addInput")}
      </Internal>
    </div>
  )
}

/**
 * What the conference committees still sitting are about: a small heading
 * and plain bullets rather than links (the panel's buttons go to the
 * conference committees). A selection ending in "...and more", kept by hand
 * in homepage.json, so it needs updating as committees report.
 */
export function ConferenceTopics() {
  const { t } = useTranslation("homepage")
  const topics = t("conferenceLinks.topics", { returnObjects: true })
  if (!Array.isArray(topics) || topics.length === 0) return null

  return (
    <>
      <p className={styles.conferenceTopicsHeading}>
        {t("conferenceLinks.topicsHeading")}
      </p>
      <ul className={styles.conferenceTopics}>
        {topics.map(topic => (
          <li key={topic}>{topic}</li>
        ))}
      </ul>
    </>
  )
}
