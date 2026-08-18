import { useTranslation } from "next-i18next"
import { useState } from "react"
import Image from "react-bootstrap/Image"

import styles from "./Homepage.module.css"

import { NEWSLETTER_SIGNUP_URL, TRAINING_CALENDAR_URL } from "components/common"
import { faArrowRight } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Internal } from "components/links"
import TopicsSection, { TopicChips } from "./TopicsSection"
import TypedPrompt from "./TypedPrompt"

export default function HeroSection() {
  const { t } = useTranslation("homepage")
  /* The ask field is a demo: focusing it swaps the typed placeholder for a real
     input and raises a panel of suggestions, as on the Digital Democracy
     heroes. Nothing submits. */
  const [asking, setAsking] = useState(false)

  return (
    <>
      <section className={styles.heroSection}>
        <div className={styles.skylineBackground} aria-hidden="true">
          {/* Four building clusters, cut at the natural gaps in the skyline.
            Styled only under the Digital Democracy skin; inert otherwise. */}
          <span className={styles.skylineSlice1} />
          <span className={styles.skylineSlice2} />
          <span className={styles.skylineSlice3} />
          <span className={styles.skylineSlice4} />
          <span className={styles.clouds} />
          <span className={styles.leaf} />
          <span className={styles.leafTwo} />
          <span className={styles.statehouseBack} />
          <span className={styles.flagBack} />
        </div>
        <div className={styles.sectionShell}>
          <div className={styles.hero}>
            {/* Panel and illustration share one container on the left; the copy
              takes the right column on its own. */}
            <div className={styles.heroMain}>
              <div className={styles.heroVisual}>
                <Image
                  className={styles.statehouse}
                  src="/statehouse-alt.svg"
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
                <p className={styles.heroSubhead}>{t("hero.subhead")}</p>
                <p className={styles.heroLead}>{t("hero.lead")}</p>
                {/* Body copy parked while the topic circles are tried out.
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
            */}

                {/* Actions parked while the topic circles are tried out.
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
            */}
              </div>
            </div>

            {/* Demo only: mimics the search block in the Digital Democracy
                heroes. Not wired to anything. */}
            <div className={styles.heroSearch}>
              <p className={styles.heroSearchLabel}>{t("topicsHeading")}</p>
              <TopicChips />
              {/* Field parked while the topic chips are tried on their own. */}
              {false && (
                <div
                  className={styles.heroSearchField}
                  onClick={() => setAsking(true)}
                >
                  {/* Decorative and inert: it marks the field as MAPLE's, and is
                    not a control. */}
                  <img
                    className={styles.heroSearchMascot}
                    src="/maple-mascot.png"
                    alt=""
                    aria-hidden="true"
                  />
                  {asking ? (
                    <input
                      autoFocus
                      className={styles.heroSearchInput}
                      onBlur={() => setAsking(false)}
                      placeholder={t("hero.searchLead")}
                      aria-label={t("hero.searchLabel")}
                    />
                  ) : (
                    <span className={styles.heroSearchText}>
                      <strong>{t("hero.searchLead")}</strong> <TypedPrompt />
                    </span>
                  )}
                  <FontAwesomeIcon icon={faArrowRight} />
                </div>
              )}

              {asking && (
                <div className={styles.heroSuggest}>
                  <p className={styles.heroSuggestHeading}>
                    {t("hero.suggestHeading")}
                  </p>
                  <ul>
                    <li>{t("hero.suggest.people")}</li>
                    <li>{t("hero.suggest.bills")}</li>
                    <li>{t("hero.suggest.hearings")}</li>
                    <li>{t("hero.suggest.testimony")}</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className={styles.sectionShell}>
        <div className={styles.topicsBelow}>
          <h2 className={styles.topicsHeading}>{t("topicsHeading")}</h2>
          <TopicsSection />
        </div>
      </section>
    </>
  )
}
