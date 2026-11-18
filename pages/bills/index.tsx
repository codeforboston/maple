import { useTranslation } from "next-i18next"
import { PageColumn } from "components/shared/PageColumn"
import { FooterStatehouse } from "components/shared/FooterStatehouse"
import styled from "styled-components"
import { createPage } from "components/page"
import { BillSearch } from "components/search"
import { createGetStaticTranslationProps } from "components/translations"

export default createPage({
  titleI18nKey: "navigation.browseBills",
  Page: () => {
    const { t } = useTranslation("search")

    return (
      <ArtColumn $width="xwide" className="mt-3">
        <h1>{t("browse_bills")}</h1>
        {/* The statehouse on the footer's edge, at the left. */}
        <FooterStatehouse />
        <BillSearch />
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
  "testimony"
])
