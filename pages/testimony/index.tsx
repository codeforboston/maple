import { createPage } from "components/page"
import { TestimonySearch } from "components/search/testimony/TestimonySearch"
import { PageColumn } from "components/shared/PageColumn"
import { FooterStatehouse } from "components/shared/FooterStatehouse"
import { createGetStaticTranslationProps } from "components/translations"
import { useTranslation } from "next-i18next"
import styled from "styled-components"

export default createPage({
  titleI18nKey: "navigation.browseTestimony",
  Page: () => {
    return (
      <ArtColumn $width="xwide" className="mt-3">
        {/* The statehouse on the footer's edge, at the left. */}
        <FooterStatehouse />
        <h1>{useTranslation("common").t("navigation.browseTestimony")}</h1>
        <TestimonySearch />
      </ArtColumn>
    )
  }
})

/* Positioned, as it has been since the page carried art placed against it. */
const ArtColumn = styled(PageColumn)`
  position: relative;
`

export const getStaticProps = createGetStaticTranslationProps([
  "auth",
  "search",
  "common",
  "footer",
  "testimony",
  "profile"
])
