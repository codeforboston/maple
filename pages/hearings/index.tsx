import { GetStaticProps } from "next"
import { useTranslation } from "next-i18next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"

import { PageColumn } from "components/shared/PageColumn"
import { FooterStatehouse } from "components/shared/FooterStatehouse"
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
        <h1>{t("navigation.browseHearings")}</h1>
        <HearingSearch />
      </ArtColumn>
    )
  }
})

export default HearingsPage

/* Positioned, as it has been since the page carried art placed against it.
   flow-root keeps the last element's bottom margin (the pagination's) inside
   the column, so the column's bottom edge is where the footer starts. */
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
