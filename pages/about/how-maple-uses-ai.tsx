import { createPage } from "../../components/page"
import { createGetStaticTranslationProps } from "components/translations"
import MapleAI from "components/about/MapleAI/MapleAI"

export default createPage({
  titleI18nKey: "navigation.ai",
  Page: () => {
    return <MapleAI />
  }
})

export const getStaticProps = createGetStaticTranslationProps([
  "auth",
  "common",
  "footer",
  "mapleAI"
])
