import { useTranslation } from "next-i18next"
import Image from "react-bootstrap/Image"

import styles from "./Homepage.module.css"

import { NEWSLETTER_SIGNUP_URL, TRAINING_CALENDAR_URL } from "components/common"
import { Internal } from "components/links"

export default function HeroSection() {
  const { t } = useTranslation("homepage")

  return (
    <section className={styles.heroSection}>
      <div className={styles.skylineBackground} aria-hidden="true" />
      <div className={styles.sectionShell}>
        <div className={styles.hero}>
          <div className={styles.heroVisual}>
            <Image
              className={styles.statehouse}
              src="/statehouse.svg"
              alt=""
              aria-hidden="true"
            />
          </div>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>{t("hero.title")}</h1>
            <p className={styles.heroBody}>{t("hero.body")}</p>
            <p className={styles.heroBody}>
              {t("hero.body2a")}{" "}
              <a
                href={TRAINING_CALENDAR_URL}
                style={{ color: "white" }}
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
                style={{ color: "white" }}
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
      </div>
    </section>
  )
}
