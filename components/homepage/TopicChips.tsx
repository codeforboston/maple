import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useTranslation } from "next-i18next"
import styles from "./Homepage.module.css"
import { topics } from "./TopicsSection"

/**
 * The topic circles from ./TopicsSection at a smaller size, used inside the
 * hero's search panel: a disc and its name side by side, so they read as a row
 * of shortcuts.
 */
export default function TopicChips() {
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
