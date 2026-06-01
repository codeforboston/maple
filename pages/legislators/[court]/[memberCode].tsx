import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"
import { z } from "zod"
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
  titleI18nKey: "titles.legislatorProfile",
  Page: ({ court, memberCode }) => (
    <LegislatorProfilePage court={court} memberCode={memberCode} />
  )
})

export const getServerSideProps: GetServerSideProps = async ctx => {
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
      ...(await serverSideTranslations(locale, ["auth", "common", "footer"]))
    }
  }
}
