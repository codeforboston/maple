import { useTranslation } from "next-i18next"
import { PageColumn } from "components/shared/PageColumn"
import { PageArt } from "components/shared/PageArt"
import { FooterStatehouse } from "components/shared/FooterStatehouse"
import { LearnGround } from "components/shared/LearnGround"
import { LEARN_LOOK } from "components/Navbar"
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
        {LEARN_LOOK.includes("/bills") && <LearnGround />}
        <h1>{t("browse_bills")}</h1>
        {/* The statehouse on the footer's edge, at the left. */}
        <FooterStatehouse />
        {/* Legislation under a magnifying glass (searching bills) on the
            right, and with a lightbulb on the left. */}
        <PageArt
          src="/Legislation + Mag Glass.svg"
          leftSrc="/Leg + Lightbulb-alt-flip.svg"
          // Positions tuned by eye, first set alongside a statehouse and session
          // line that bills no longer has.
          out={2.5}
          rightDrop={3.5}
          // A smaller right piece; the left stays at its usual 7.5rem.
          size={7.5}
          leftSize={7.5}
          leftLift={4}
        />
        <BillSearch />
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
  "testimony"
])
