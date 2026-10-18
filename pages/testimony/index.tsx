import { createPage } from "components/page"
import { TestimonySearch } from "components/search/testimony/TestimonySearch"
import { PageColumn } from "components/shared/PageColumn"
import { PageArt } from "components/shared/PageArt"
import { FooterStatehouse } from "components/shared/FooterStatehouse"
import { SectionGround } from "components/shared/SectionGround"
import { SECTION_GROUND_PAGES } from "components/Navbar"
import { createGetStaticTranslationProps } from "components/translations"
import { useTranslation } from "next-i18next"
import styled from "styled-components"

export default createPage({
  titleI18nKey: "navigation.browseTestimony",
  Page: () => {
    return (
      <ArtColumn $width="xwide" className="mt-3">
        {SECTION_GROUND_PAGES.includes("/testimony") && <SectionGround />}
        {/* The statehouse on the footer's edge, at the left. */}
        <FooterStatehouse />
        <PageArt
          // The hand writing on the right, the testimony card on the left.
          src="/Writing Hand.svg"
          leftSrc="/testimony-panel-empty 1.svg"
          // Spaced as on ballot questions: further out from the page, the left
          // raised a little. The hand is 7rem; the card is bigger, since its
          // drawing sits smaller in its frame.
          out={1.5}
          size={7}
          leftSize={9}
          leftLift={1}
          // The hand a further 1rem out.
          rightOut={1}
          rightDrop={10}
        />
        <h1>{useTranslation("common").t("navigation.browseTestimony")}</h1>
        <TestimonySearch />
      </ArtColumn>
    )
  }
})

/* The page art places itself against this column. */
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
