import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"
import { z } from "zod"
import { flags } from "components/featureFlags"
import { BackToConferences } from "components/conference/BackToConferences"
import { ConferenceBetaBanner } from "components/conference/ConferenceBetaBanner"
import { ConferenceDetails } from "components/conference/ConferenceDetails"
import { loadConferencePage } from "components/conference/load"
import { ConferencePageProps } from "components/conference/types"
import { createPage } from "../../../components/page"

const Query = z.object({ court: z.coerce.number(), id: z.string() })

export default createPage<ConferencePageProps>({
  titleI18nKey: "titles.conference",
  // The section's beta note, the way back to the Conference Committees page
  // in a row of its own, as the explorer has it, then the conference.
  Page: props => (
    <>
      {/* On mobile, the tag alone. */}
      <ConferenceBetaBanner tagOnlyOnMobile />
      {/* Not on mobile, where a chevron before the title is the way back
          instead (ConferenceDetails.tsx). */}
      <BackToConferences divider notMobile committee />
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
      "testimony"
    ])
  ])
  if (!page) return { notFound: true }

  return { props: { ...page, ...translations } }
}
