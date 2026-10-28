import { faArrowRight } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useTranslation } from "next-i18next"
import { useState } from "react"
import { useMediaQuery } from "usehooks-ts"
import styles from "./Homepage.module.css"
import TypedPrompt from "./TypedPrompt"

/**
 * The ask field in the hero's search panel. A demo: focusing it swaps the
 * typed placeholder for a real input and raises a panel of suggestions, as on
 * the Digital Democracy heroes. Nothing submits.
 */
export default function AskField() {
  const { t } = useTranslation("homepage")
  const [asking, setAsking] = useState(false)
  // On a phone the field drops its "Ask about:" lead-in to make room.
  const isMobile = useMediaQuery("(max-width: 768px)")

  return (
    <div className={styles.heroAsk}>
      <div className={styles.heroSearchField} onClick={() => setAsking(true)}>
        {/* Decorative and inert: it marks the field as MAPLE's, and is not a
            control. */}
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
            /* On focus the typed animation stops, so the field keeps a full
               prompt rather than emptying to the lead-in alone. */
            placeholder={
              isMobile
                ? t("hero.searchDefault")
                : `${t("hero.searchLead")}  ${t("hero.searchDefault")}`
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
  )
}
