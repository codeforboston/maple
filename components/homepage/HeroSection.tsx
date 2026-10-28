import { useTranslation } from "next-i18next"
import Image from "react-bootstrap/Image"

import styles from "./Homepage.module.css"

import { NEWSLETTER_SIGNUP_URL, TRAINING_CALENDAR_URL } from "components/common"
import { Internal } from "components/links"

/**
 * The homepage hero, laid out like main's: the statehouse in its own column
 * on the left, the title, body copy and buttons on the right, over the
 * skyline.
 */
export default function HeroSection() {
  const { t } = useTranslation("homepage")

  return (
    <section className={`${styles.heroSection} ${styles.heroStatehouse}`}>
      <div className={styles.skylineBackground} aria-hidden="true">
        {/* Four building clusters, cut at the natural gaps in the skyline. */}
        <span className={styles.skylineSlice1} />
        <span className={styles.skylineSlice2} />
        <span className={styles.skylineSlice3} />
        <span className={styles.skylineSlice4} />
      </div>
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

          {/* The statehouse in its own column. */}
          <span className={styles.statehouseColumn} aria-hidden="true" />
        </div>
      </div>
    </section>
  )
}
