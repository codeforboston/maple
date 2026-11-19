import { useTranslation } from "next-i18next"
import Image from "react-bootstrap/Image"

import styles from "./Homepage.module.css"
import NewFeaturesCard from "./NewFeaturesCard"

import { NEWSLETTER_SIGNUP_URL, TRAINING_CALENDAR_URL } from "components/common"
import { Internal } from "components/links"

/**
 * The homepage hero, over the skyline: the title, body copy and buttons on the
 * left, and a panel of the site's new features on the right with a small
 * statehouse under it.
 */
export default function HeroSection() {
  const { t } = useTranslation("homepage")

  return (
    <section className={`${styles.heroSection} ${styles.heroStatehouse}`}>
      <div className={styles.skylineBackground} aria-hidden="true" />
      <div className={styles.sectionShell}>
        <div className={styles.hero}>
          {/* Hidden: the statehouse takes its own column (.statehouseColumn)
              instead. */}
          <div className={styles.heroMain}>
            <div className={styles.heroVisual}>
              <Image
                className={styles.statehouse}
                src="/statehouse.svg"
                alt=""
                aria-hidden="true"
              />
            </div>
          </div>

          <div className={styles.heroContent}>
            {/* Inner container so the copy's measure and position can be set
                independently of the grid column it sits in. */}
            <div className={styles.heroCopy}>
              <h1 className={styles.heroTitle}>{t("hero.title")}</h1>
              <p className={styles.heroBody}>{t("hero.body")}</p>
              <p className={styles.heroBody}>
                {t("hero.body2a")}{" "}
                <a
                  href={TRAINING_CALENDAR_URL}
                  className={styles.heroLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t("hero.calendar")}
                </a>{" "}
                {t("hero.body2b")}
              </p>
              <p className={styles.heroBody}>
                <a
                  href={NEWSLETTER_SIGNUP_URL}
                  className={styles.heroLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t("hero.newsletter")}
                </a>
              </p>

              <div className={styles.heroActions}>
                <Internal href="/bills" className={styles.primaryAction}>
                  {t("hero.primaryAction")}
                </Internal>
                <Internal
                  href="/about/mission-and-goals"
                  className={styles.secondaryAction}
                >
                  {t("hero.secondaryAction")}
                </Internal>
              </div>
            </div>
          </div>

          {/* The statehouse, behind the topics panel (the grid places it). */}
          <span className={styles.statehouseColumn} aria-hidden="true" />

          {/* The panel: the newer parts of the site, each a link to its page.
              The topics (TopicChips) are to come back here. */}
          <NewFeaturesCard className={styles.heroTopics} />
        </div>
      </div>
    </section>
  )
}
