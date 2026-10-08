import { useTranslation } from "next-i18next"
import { useState } from "react"
import Image from "react-bootstrap/Image"

import styles from "./Homepage.module.css"

import { NEWSLETTER_SIGNUP_URL, TRAINING_CALENDAR_URL } from "components/common"
import { faArrowRight } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Internal } from "components/links"
import { TopicChips } from "./TopicsSection"
import TypedPrompt from "./TypedPrompt"
import { useMediaQuery } from "usehooks-ts"

/**
 * Which blocks the hero shows. These are content choices, not skin choices:
 * every block is styled in both skins, so any combination works in either.
 * The defaults are what the homepage shows today.
 */
export type HeroSectionProps = {
  /** The original body copy, with the calendar and newsletter links. */
  showBody?: boolean
  /** The Get Started and Learn More buttons. */
  showActions?: boolean
  /** The topic chips and the ask field. */
  showAsk?: boolean
}

export default function HeroSection({
  showBody = false,
  showActions = false,
  showAsk = true
}: HeroSectionProps) {
  const { t } = useTranslation("homepage")
  /* The ask field is a demo: focusing it swaps the typed placeholder for a real
     input and raises a panel of suggestions, as on the Digital Democracy
     heroes. Nothing submits. */
  const [asking, setAsking] = useState(false)
  // On a phone the field drops its "Ask about:" lead-in to make room.
  const isMobile = useMediaQuery("(max-width: 768px)")

  return (
    <section className={styles.heroSection}>
      <div className={styles.skylineBackground} aria-hidden="true">
        {/* Four building clusters, cut at the natural gaps in the skyline.
            Styled only under the Digital Democracy skin; inert otherwise. */}
        <span className={styles.skylineSlice1} />
        <span className={styles.skylineSlice2} />
        <span className={styles.skylineSlice3} />
        <span className={styles.skylineSlice4} />
        {/* Clouds parked, not deleted: the .clouds rule is still in the stylesheet. */}
        {false && <span className={styles.clouds} />}
        {/* Experiment: leaves and the tinted statehouse and flag parked while
            the coloured statehouse is tried under the copy in this skin too.
        <span className={styles.leaf} />
        <span className={styles.leafTwo} />
        <span className={styles.statehouseBack} />
        <span className={styles.flagBack} />
        */}
      </div>
      <div className={styles.sectionShell}>
        <div className={styles.hero}>
          {/* Hidden in both skins: the statehouse is drawn into the background
              (.statehouseBack) or placed under the copy (.statehouseArt)
              instead. Kept while the layout is still being tried out. */}
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
              <p className={styles.heroLead}>{t("hero.lead")}</p>
              {/* The full-colour statehouse for the current MAPLE look, under
                  the copy. The Digital Democracy skin hides it and tints its
                  own silhouette into the background instead. */}
              <span className={styles.statehouseArt} aria-hidden="true" />

              {showBody && (
                <>
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
                </>
              )}

              {showActions && (
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
              )}
            </div>
          </div>

          {/* Demo only: mimics the search block in the Digital Democracy
              heroes. Not wired to anything. */}
          {showAsk && (
            <div className={styles.heroSearch}>
              <p className={styles.heroSearchLabel}>{t("topicsHeading")}</p>
              <TopicChips />
              <div className={styles.heroAsk}>
                <div
                  className={styles.heroSearchField}
                  onClick={() => setAsking(true)}
                >
                  {/* Decorative and inert: it marks the field as MAPLE's, and
                      is not a control. */}
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
                      /* On focus the typed animation stops, so the field keeps
                         a full prompt rather than emptying to the lead-in
                         alone. */
                      placeholder={
                        isMobile
                          ? t("hero.searchDefault")
                          : `${t("hero.searchLead")}  ${t(
                              "hero.searchDefault"
                            )}`
                      }
                      aria-label={t("hero.searchLabel")}
                    />
                  ) : (
                    <span className={styles.heroSearchText}>
                      {!isMobile && <strong>{t("hero.searchLead")}</strong>}{" "}
                      <TypedPrompt />
                    </span>
                  )}
                  <FontAwesomeIcon icon={faArrowRight} />
                </div>

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
          )}
        </div>
      </div>
    </section>
  )
}
