import { useTranslation } from "next-i18next"
import { BetaBanner } from "../shared/BetaBanner"

/**
 * The section's beta note, over the Conference Committees page and each
 * conference's page alike, so it stays as a reader moves between them. Sticks
 * at the top of the window once it reaches it, the conference's title and tabs
 * pinning under it (styles/globals.css, navbar.ts).
 */
export function ConferenceBetaBanner({
  tagOnlyOnMobile = false
}: {
  /** On a phone, the BETA tag alone (BetaBanner's tagOnlyOnMobile). */
  tagOnlyOnMobile?: boolean
}) {
  const { t } = useTranslation("conferences")
  return (
    <div className="conference-beta-banner">
      <BetaBanner tagOnlyOnMobile={tagOnlyOnMobile}>
        {t("beta_feedback")}
      </BetaBanner>
    </div>
  )
}
