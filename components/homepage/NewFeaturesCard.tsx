import { faArrowRight, faChevronRight } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Trans, useTranslation } from "next-i18next"
import { flags } from "components/featureFlags"
import { Internal, maple } from "components/links"
import {
  BetaTag,
  FeatureCalloutButton
} from "components/shared/CommonComponents"
import { CopyEmail, FEEDBACK_EMAIL } from "components/shared/CopyEmail"
import styles from "./Homepage.module.css"

/**
 * The hero panel's invitation to the newer parts of the site: a headline, then
 * a tile each, the whole tile a link to its page, with its name and BETA tag,
 * a line on what it is and "Try it". A tile shows only
 * while its page's flag is on, and the card not at all when none is.
 */
export default function NewFeaturesCard({ className }: { className?: string }) {
  const { t } = useTranslation(["homepage", "common"])

  const features = [
    {
      key: "conferences",
      enabled: flags().conferences,
      href: maple.conferences()
    },
    {
      key: "lobbying",
      enabled: flags().lobbyingTable,
      href: "/lobbying"
    }
  ].filter(f => f.enabled)

  if (features.length === 0) return null

  return (
    <div className={className}>
      {/* The title, with the bill page's *NEW* badge
          (FeatureCalloutButton, components/bill/Summary.tsx) at the far right
          of its line. */}
      <p className={`${styles.newFeaturesTitle} ${styles.newFeaturesTitleRow}`}>
        <span>{t("newFeatures.title")}</span>
        <FeatureCalloutButton className={`btn btn-secondary ${styles.newTag}`}>
          {t("new_feature", { ns: "common" })}
        </FeatureCalloutButton>
      </p>
      <p className={styles.newFeaturesSubtitle}>
        <Trans
          t={t}
          i18nKey="newFeatures.subtitle"
          values={{ email: FEEDBACK_EMAIL }}
          // The address, which copies itself (CopyEmail); and a line break
          // before "Send feedback" on a phone only.
          components={{
            mail: <CopyEmail />,
            phoneBreak: <br className={styles.phoneBreak} />
          }}
        />
      </p>
      <ul className={styles.newFeatures}>
        {features.map(({ key, href }) => {
          const name = t(`newFeatures.${key}.name`)
          return (
            <li key={key}>
              <Internal href={href} className={styles.newFeatureTile}>
                {/* The BETA tag, as the header's, after the name, or beside
                    the chevron where the tiles stack (Homepage.module.css). */}
                <span className={styles.newFeatureName}>
                  {name}
                  <BetaTag className={styles.newFeatureBeta}>
                    {t("common:beta_feature")}
                  </BetaTag>
                </span>
                <span className={styles.newFeatureBody}>
                  {t(`newFeatures.${key}.body`)}
                </span>
                <span className={styles.newFeatureAction}>
                  {t("newFeatures.tryIt")}
                  <FontAwesomeIcon icon={faArrowRight} aria-hidden />
                </span>
                {/* Shown in place of "Try it" where the tiles stack beside
                    the copy (Homepage.module.css). */}
                <FontAwesomeIcon
                  icon={faChevronRight}
                  className={styles.newFeatureChevron}
                  aria-hidden
                />
              </Internal>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
