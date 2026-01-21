import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"
import { z } from "zod"
import { flags } from "components/featureFlags"
import { HearingDetails } from "components/hearing/HearingDetails"
import { createPage } from "../../components/page"
import { fetchHearingData, HearingData } from "components/hearing/hearing"

const Query = z.object({ hearingId: z.coerce.number() })

export default createPage<{ hearingData: HearingData }>({
  titleI18nKey: "Hearing",
  Page: ({ hearingData }) => {
    return <HearingDetails hearingData={hearingData} />
  }
})

export const getServerSideProps: GetServerSideProps = async ctx => {
  ctx.res.setHeader(
    "Cache-Control",
    "public, s-maxage=3600, stale-while-revalidate=3600"
  )

  const locale = ctx.locale ?? ctx.defaultLocale ?? "en"

  const query = Query.safeParse(ctx.query)
  if (!query.success) return { notFound: true }
  if (!flags().hearingsAndTranscriptions) return { notFound: true }

  if (!ctx.params || !ctx.params.hearingId) return { notFound: true }
  const hearingId = Array.isArray(ctx.params.hearingId)
    ? ctx.params.hearingId.join("-")
    : ctx.params.hearingId
  const hearingData = await fetchHearingData(hearingId)
  if (!hearingData) return { notFound: true }

  return {
    props: {
      hearingData: hearingData,
      ...(await serverSideTranslations(locale, [
        "auth",
        "common",
        "footer",
        "hearing"
      ]))
    }
  }
}
