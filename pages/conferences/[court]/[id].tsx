import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"
import { z } from "zod"
import { flags } from "components/featureFlags"
import { ConferenceBetaBanner } from "components/conference/ConferenceBetaBanner"
import { ConferenceDetails } from "components/conference/ConferenceDetails"
import { loadConferencePage } from "components/conference/load"
import {
  ConferencePageProps,
  conferenceName
} from "components/conference/types"
import { formatBillId } from "components/formatting"
import { createPage } from "../../../components/page"

const Query = z.object({ court: z.coerce.number(), id: z.string() })

export default createPage<ConferencePageProps>({
  titleI18nKey: "titles.conference",
  head: ({ conference }, t) => {
    const name = conferenceName(conference)
    const bills = [conference.senateBillId, conference.houseBillId]
      .map(formatBillId)
      .join(", ")
    return {
      title: t("head.conference_title", { name, bills }),
      description: t(
        conference.covered
          ? "head.conference_description"
          : "head.conference_description_not_covered",
        { title: conference.title }
      )
    }
  },
  // The section's beta note across the window, then the conference, which
  // puts the way back to the Conference Committees page over its own column
  // (ConferenceDetails.tsx).
  Page: props => (
    <>
      {/* On mobile, the tag alone. */}
      <ConferenceBetaBanner tagOnlyOnMobile />
      <ConferenceDetails {...props} />
    </>
  )
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
    serverSideTranslations(locale, [
      "auth",
      "common",
      "footer",
      "conferences",
      "profile",
      "testimony"
    ])
  ])
  if (!page) return { notFound: true }

  return { props: { ...page, ...translations } }
}
