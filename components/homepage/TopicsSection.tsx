import {
  faBriefcase,
  faGavel,
  faGraduationCap,
  faHeartPulse,
  faHouse,
  faLeaf
} from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useTranslation } from "next-i18next"
import styles from "./Homepage.module.css"

/**
 * A grid of topic circles, borrowed from the agenda row on the Digital
 * Democracy homepages: a tinted disc, an icon, and a label beneath it.
 *
 * These are built from the subtopic level of the bill taxonomy in
 * functions/src/bills/types.ts rather than from its 21 top-level categories,
 * and a subtopic may belong to more than one circle. That is deliberate:
 * property tax is both housing and money, the MBTA is both climate and cost of
 * living, child care is both education and health. A strict partition put each
 * in one place and made it wrong in the other.
 *
 * The mapping is therefore editorial and maintained by hand; it cannot be
 * derived from the taxonomy. Unlinked for now, since what each should filter
 * to is still open.
 */
const topics = [
  { key: "education", icon: faGraduationCap, tint: "blue" },
  { key: "health", icon: faHeartPulse, tint: "red" },
  { key: "climate", icon: faLeaf, tint: "green" },
  { key: "democracy", icon: faGavel, tint: "purple" },
  { key: "housing", icon: faHouse, tint: "amber" },
  { key: "work", icon: faBriefcase, tint: "gray" }
] as const

/**
 * The same circles at a smaller size, used inside the hero's ask panel: a disc
 * and its name side by side, so they read as a row of shortcuts.
 */
export function TopicChips() {
  const { t } = useTranslation("homepage")

  return (
    <div className={styles.topicChips}>
      {topics.map(({ key, icon, tint }) => (
        <span className={styles.topicChip} key={key}>
          <span
            className={styles.topicChipDisc}
            style={{
              background: `var(--maple-color-${tint}-subtle-bg)`,
              color: `var(--maple-color-${tint}-subtle-text)`
            }}
          >
            <FontAwesomeIcon icon={icon} />
          </span>
          {t(`topics.${key}`)}
        </span>
      ))}
    </div>
  )
}

export default function TopicsSection() {
  const { t } = useTranslation("homepage")

  return (
    <div className={styles.topics}>
      {topics.map(({ key, icon, tint }) => (
        <div className={styles.topicLink} key={key}>
          <span
            className={styles.topicDisc}
            style={{
              background: `var(--maple-color-${tint}-subtle-bg)`,
              color: `var(--maple-color-${tint}-subtle-text)`
            }}
          >
            <FontAwesomeIcon icon={icon} />
          </span>
          <span className={styles.topicLabel}>{t(`topics.${key}`)}</span>
        </div>
      ))}
    </div>
  )
}
