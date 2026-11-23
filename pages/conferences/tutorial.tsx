import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"
import { flags } from "components/featureFlags"
import { ConferenceBetaBanner } from "components/conference/ConferenceBetaBanner"
import { ConferenceTutorial } from "components/conference/ConferenceTutorial"
import { maple } from "components/links"
import { createPage } from "../../components/page"

/** The tutorial for the conference committee pages: the section's beta
 * note, then the video. */
export default createPage({
  titleI18nKey: "titles.conference_tutorial",
  share: {
    titleI18nKey: "titles.conference_tutorial",
    descriptionI18nKey: "conferences:tutorial.share_description",
    path: maple.conferenceTutorial(),
    image: "/conference-tutorial-share.png"
  },
  Page: () => (
    <>
      <ConferenceBetaBanner />
      <ConferenceTutorial />
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
  return {
    props: await serverSideTranslations(locale, [
      "auth",
      "common",
      "footer",
      "conferences"
    ])
  }
}
