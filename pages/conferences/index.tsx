import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"
import { currentGeneralCourt } from "functions/src/shared"
import { flags } from "components/featureFlags"
import { ConferenceHero } from "components/conference/ConferenceHero"
import { loadLanding } from "components/conference/load"
import { ConferenceLanding } from "components/conference/types"
import { createPage } from "../../components/page"

type Props = { landing: ConferenceLanding | null }

export default createPage<Props>({
  titleI18nKey: "titles.conferences",
  Page: ({ landing }) => <ConferenceHero landing={landing} />
})

export const getServerSideProps: GetServerSideProps<Props> = async ctx => {
  if (!flags().conferences) return { notFound: true }
  ctx.res.setHeader(
    "Cache-Control",
    "public, s-maxage=60, stale-while-revalidate=300"
  )

  const locale = ctx.locale ?? ctx.defaultLocale ?? "en"
  const [landing, translations] = await Promise.all([
    loadLanding(currentGeneralCourt),
    serverSideTranslations(locale, ["auth", "common", "footer", "conferences"])
  ])

  // A court with no conferences yet still has the hero, with the explorer
  // its only way on.
  return { props: { landing, ...translations } }
}
