import { createPage } from "../../components/page"
import { InTheNews } from "../../components/InTheNews/InTheNews"
import { createGetStaticTranslationProps } from "components/translations"

export default createPage({
  titleI18nKey: "titles.in_the_news",
  Page: () => {
    return <InTheNews />
  }
})

export const getStaticProps = createGetStaticTranslationProps([
  "auth",
  "common",
  "footer",
  "inTheNews"
])
