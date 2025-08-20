import { GetServerSideProps } from "next"
import { useRouter } from "next/router"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"
import { z } from "zod"
import { flags } from "components/featureFlags"
import { HearingDetails } from "components/hearing/HearingDetails"
import { createPage } from "../../components/page"

const Query = z.object({ hearingId: z.coerce.number() })

export default createPage<{ hearingId: number }>({
  titleI18nKey: "Hearing",
  Page: () => {
    const hearingId = useRouter().query.hearingId
    return <HearingDetails hearingId={hearingId} />
  }
})

export const getServerSideProps: GetServerSideProps = async ctx => {
  ctx.res.setHeader(
    "Cache-Control",
    "public, s-maxage=10, stale-while-revalidate=59"
  )

  const locale = ctx.locale ?? ctx.defaultLocale ?? "en"

  const query = Query.safeParse(ctx.query)
  if (!query.success) return { notFound: true }
  if (!flags().hearingsAndTranscriptions) return { notFound: true }

  return {
    props: {
      ...(await serverSideTranslations(locale, ["auth", "common", "footer"]))
    }
  }
}
