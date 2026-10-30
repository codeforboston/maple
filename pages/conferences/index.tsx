import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"
import { currentGeneralCourt } from "functions/src/shared"
import { flags } from "components/featureFlags"
import { ConferenceDetails } from "components/conference/ConferenceDetails"
import { loadLandingPage } from "components/conference/load"
import { ConferencePageProps } from "components/conference/types"
import { maple } from "components/links"
import { createPage } from "../../components/page"

export default createPage<ConferencePageProps>({
  titleI18nKey: "titles.conferences",
  Page: props => <ConferenceDetails {...props} openOnHero />
})

export const getServerSideProps: GetServerSideProps = async ctx => {
  if (!flags().conferences) return { notFound: true }
  ctx.res.setHeader(
    "Cache-Control",
    "public, s-maxage=60, stale-while-revalidate=300"
  )

  const locale = ctx.locale ?? ctx.defaultLocale ?? "en"
  const [page, translations] = await Promise.all([
    loadLandingPage(currentGeneralCourt),
    serverSideTranslations(locale, ["auth", "common", "footer", "conferences"])
  ])
  // A court with no conferences yet has nothing to open on; the explorer says
  // so, where a 404 would leave the navbar's link dead.
  if (!page)
    return {
      redirect: { destination: maple.conferenceExplorer(), permanent: false }
    }

  return { props: { ...page, ...translations } }
}
