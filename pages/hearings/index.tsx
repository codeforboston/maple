import { GetStaticProps } from "next"
import { useTranslation } from "next-i18next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"

import { PageColumn } from "components/shared/PageColumn"
import { PageArt } from "components/shared/PageArt"
import { FooterStatehouse } from "components/shared/FooterStatehouse"
import { SectionGround } from "components/shared/SectionGround"
import { SECTION_GROUND_PAGES } from "components/Navbar"
import styled from "styled-components"
import { flags } from "components/featureFlags"
import { createPage } from "components/page"
import { HearingSearch } from "components/search"

const HearingsPage = createPage({
  titleI18nKey: "navigation.browseHearings",
  Page: () => {
    const { t } = useTranslation("common")

    return (
      <ArtColumn $width="xwide" className="mt-3">
        {/* The statehouse on the footer's edge, at the left. */}
        <FooterStatehouse />
        {/* A microphone (testifying) on the right and a speaker with
            legislation on the left, sized as on ballot questions (both 8rem)
            and further out from the page, the speaker furthest. */}
        <PageArt
          src="/Mic+Testify.svg"
          leftSrc="/speaker with leg.svg"
          leftTilt={-6}
          out={1.5}
          size={8}
          sameSize
          leftOut={1}
        />
        {SECTION_GROUND_PAGES.includes("/hearings") && <SectionGround />}
        <h1>{t("navigation.browseHearings")}</h1>
        <HearingSearch />
      </ArtColumn>
    )
  }
})

export default HearingsPage

/* The page art places itself against this column. flow-root keeps the last
   element's bottom margin (the pagination's) inside the column, so the
   column's bottom edge is where the footer starts. */
const ArtColumn = styled(PageColumn)`
  position: relative;
  display: flow-root;
`

export const getStaticProps: GetStaticProps = async ctx => {
  if (!flags().hearingsAndTranscriptions) return { notFound: true }

  const locale = ctx.locale ?? ctx.defaultLocale ?? "en"

  return {
    props: {
      ...(await serverSideTranslations(locale, [
        "auth",
        "common",
        "footer",
        "hearing",
        "search"
      ]))
    }
  }
}
