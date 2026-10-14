import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"
import { currentGeneralCourt } from "functions/src/shared"
import { flags } from "components/featureFlags"
import { ConferenceExplorer } from "components/conference/ConferenceExplorer"
import { loadConferenceIndex } from "components/conference/load"
import { ConferenceIndexProps } from "components/conference/types"
import { createPage } from "../../components/page"

export default createPage<ConferenceIndexProps>({
  titleI18nKey: "titles.conferences",
  Page: props => <ConferenceExplorer {...props} />
})

export const getServerSideProps: GetServerSideProps = async ctx => {
  if (!flags().conferences) return { notFound: true }
  ctx.res.setHeader(
    "Cache-Control",
    "public, s-maxage=60, stale-while-revalidate=300"
  )

  const locale = ctx.locale ?? ctx.defaultLocale ?? "en"
  const [index, translations] = await Promise.all([
    loadConferenceIndex(currentGeneralCourt),
    serverSideTranslations(locale, ["auth", "common", "footer", "conferences"])
  ])

  return { props: { ...index, ...translations } }
}
