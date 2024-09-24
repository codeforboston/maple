import { createPage } from "../../components/page"
import { createGetStaticTranslationProps } from "components/translations"
import MapleAI from "components/about/MapleAI/MapleAI"

export default createPage({
  title: "How Maple Uses AI",
  Page: () => {
    return (
      <div>
        <MapleAI />
      </div>
    )
  }
})

export const getStaticProps = createGetStaticTranslationProps([
  "auth",
  "common",
  "footer",
  "mapleAI"
])
