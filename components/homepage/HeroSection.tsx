import { useTranslation } from "next-i18next"
import Image from "react-bootstrap/Image"

import styles from "./Homepage.module.css"

import { NEWSLETTER_SIGNUP_URL, TRAINING_CALENDAR_URL } from "components/common"
import { Internal } from "components/links"
import HeroSearchPanel from "./HeroSearchPanel"
import { ConferenceActions, ConferenceTopics } from "./ConferenceLinks"

/**
 * Which blocks the hero shows. These are content choices, not skin choices:
 * every block is styled in both skins, so any combination works in either.
 * The defaults are what the homepage shows today.
 */
export type HeroSectionProps = {
  /** The redesign's lead paragraph under the title. */
  showLead?: boolean
  /** The original body copy, with the calendar and newsletter links. */
  showBody?: boolean
  /** The Get Started and Learn More buttons. */
  showActions?: boolean
  /** The search panel: its heading, introduction, what the open conference
   * committees cover, and buttons to them. */
  showAsk?: boolean
  /** The statehouse in its own column, in the search panel's place, rather
   * than under the copy, laid out like main's hero: statehouse on the left,
   * copy on the right. The panel is left out while this is on. */
  statehouseColumn?: boolean
}

export default function HeroSection({
  showLead = true,
  showBody = false,
  showActions = false,
  showAsk = true,
  statehouseColumn = false
}: HeroSectionProps) {
  const { t } = useTranslation("homepage")

  return (
    <section
      className={`${styles.heroSection} ${
        statehouseColumn ? styles.heroStatehouse : ""
      }`}
    >
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
              {showLead && <p className={styles.heroLead}>{t("hero.lead")}</p>}
              {/* The full-colour statehouse for the current MAPLE look, under
                  the copy. The Digital Democracy skin hides it and tints its
                  own silhouette into the background instead. */}
              {!statehouseColumn && (
                <span className={styles.statehouseArt} aria-hidden="true" />
              )}

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

          {/* With statehouseColumn, the statehouse takes its own column and
              the panel below is left out. */}
          {statehouseColumn && (
            <span className={styles.statehouseColumn} aria-hidden="true" />
          )}

          {showAsk && !statehouseColumn && (
            <HeroSearchPanel
              title={t("topicsHeading")}
              description={t("conferenceLinks.intro")}
              topics={<ConferenceTopics />}
              search={<ConferenceActions />}
            />
          )}
        </div>
      </div>
    </section>
  )
}
