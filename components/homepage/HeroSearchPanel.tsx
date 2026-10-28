import { ReactNode } from "react"
import styles from "./Homepage.module.css"

export type HeroSearchPanelProps = {
  /** The heading at the top of the panel. */
  title: ReactNode
  /** A short introduction under the heading, for what fills the slots. */
  description?: ReactNode
  /** Under the heading: on the homepage, the topic chips (./TopicChips). */
  topics?: ReactNode
  /** Under the topics: on the homepage, the ask field (./AskField). */
  search?: ReactNode
}

/**
 * The panel in the hero's right column, modelled on the search block in the
 * Digital Democracy heroes: a heading, an optional introduction and two slots. It reads its colours from
 * the hero tokens on .heroSection, so it is meant to sit inside the hero.
 */
export default function HeroSearchPanel({
  title,
  description,
  topics,
  search
}: HeroSearchPanelProps) {
  return (
    <div className={styles.heroSearch}>
      <p className={styles.heroSearchLabel}>{title}</p>
      {description && (
        <p className={styles.heroSearchDescription}>{description}</p>
      )}
      {topics}
      {search}
    </div>
  )
}
