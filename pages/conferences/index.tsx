import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"
import { currentGeneralCourt } from "functions/src/shared"
import { flags } from "components/featureFlags"
import { ConferenceHero } from "components/conference/ConferenceHero"
import { loadLandingAndRail } from "components/conference/load"
import { maple } from "components/links"
import { createPage } from "../../components/page"
import { ConferenceBetaBanner } from "components/conference/ConferenceBetaBanner"
import { ConferenceSummary } from "components/conference/types"
import styled from "styled-components"

/** The beta note and the hero under it together a screen tall below the
 * navbar, the hero taking what the note leaves (ConferenceHero's Section),
 * so the note pushes nothing below the fold. */
const Screen = styled.div`
  display: flex;
  flex-direction: column;
  min-height: calc(100lvh - var(--maple-navbar-height));
`

/** The conference the hero's button opens, or null where there is none,
 * and every conference, which it lists on mobile to choose from. */
type Props = { see: string | null; conferences: ConferenceSummary[] | null }

/** The Conference Committees page: the section's beta note, then what a
 * conference committee is. */
function ConferencesPage({ see, conferences }: Props) {
  return (
    <Screen>
      {/* On mobile, the tag alone. */}
      <ConferenceBetaBanner tagOnlyOnMobile />
      <ConferenceHero see={see} conferences={conferences} />
    </Screen>
  )
}

export default createPage<Props>({
  titleI18nKey: "titles.conferences",
  Page: props => <ConferencesPage {...props} />
})

export const getServerSideProps: GetServerSideProps = async ctx => {
  if (!flags().conferences) return { notFound: true }
  ctx.res.setHeader(
    "Cache-Control",
    "public, s-maxage=60, stale-while-revalidate=300"
  )

  const locale = ctx.locale ?? ctx.defaultLocale ?? "en"
  const [{ landing, conferences }, translations] = await Promise.all([
    loadLandingAndRail(currentGeneralCourt),
    serverSideTranslations(locale, ["auth", "common", "footer", "conferences"])
  ])
  // The page always opens, without a redirect. Its button opens the first
  // conference; where the court has none yet, as a new session starts, it is
  // disabled. Only the link goes to the page, not the conference.
  const see = landing ? maple.conference(landing) : null

  return {
    props: {
      see,
      conferences: landing ? conferences : null,
      ...translations
    }
  }
}
