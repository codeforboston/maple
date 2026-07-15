import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"
import { z } from "zod"

import { flags } from "components/featureFlags"
import { LegislatorProfilePage } from "components/LegislatorProfile"
import { createPage } from "components/page"

const Query = z.object({
  court: z.coerce.number(),
  memberCode: z.string()
})

export default createPage<{
  court: number
  memberCode: string
}>({
  titleI18nKey: "navigation.legislator",
  Page: ({ court, memberCode }) => (
    <LegislatorProfilePage court={court} memberCode={memberCode} />
  )
})

export const getServerSideProps: GetServerSideProps = async ctx => {
  if (!flags().legislators) {
    return { redirect: { destination: "/404", permanent: false } }
  }

  ctx.res.setHeader(
    "Cache-Control",
    "public, s-maxage=60, stale-while-revalidate=300"
  )

  const query = Query.safeParse(ctx.query)
  if (!query.success) return { notFound: true }

  const locale = ctx.locale ?? ctx.defaultLocale ?? "en"

  return {
    props: {
      ...query.data,
      ...(await serverSideTranslations(locale, [
        "auth",
        "common",
        "footer",
        "legislators",
        "profile",
        "testimony"
      ]))
    }
  }
}
