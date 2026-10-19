import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"
import { z } from "zod"
import { flags } from "components/featureFlags"
import { ConferenceDetails } from "components/conference/ConferenceDetails"
import { loadConferencePage } from "components/conference/load"
import { ConferencePageProps } from "components/conference/types"
import { createPage } from "../../../components/page"

const Query = z.object({ court: z.coerce.number(), id: z.string() })

export default createPage<ConferencePageProps>({
  titleI18nKey: "titles.conference",
  Page: props => <ConferenceDetails {...props} />
})

export const getServerSideProps: GetServerSideProps = async ctx => {
  if (!flags().conferences) return { notFound: true }
  ctx.res.setHeader(
    "Cache-Control",
    "public, s-maxage=60, stale-while-revalidate=300"
  )

  const locale = ctx.locale ?? ctx.defaultLocale ?? "en"

  const query = Query.safeParse(ctx.query)
  if (!query.success) return { notFound: true }

  const [page, translations] = await Promise.all([
    loadConferencePage(query.data.court, query.data.id),
    serverSideTranslations(locale, ["auth", "common", "footer", "conferences"])
  ])
  if (!page) return { notFound: true }

  return { props: { ...page, ...translations } }
}
