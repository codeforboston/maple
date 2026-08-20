import { createPage } from "../../components/page"
import AboutTestimony from "components/learn/Testimony/AboutTestimony"
import { createGetStaticTranslationProps } from "components/translations"

export default createPage({
  titleI18nKey: "titles.about_testimony",
  Page: () => <AboutTestimony />
})

export const getStaticProps = createGetStaticTranslationProps([
  "auth",
  "common",
  "footer",
  "learn"
])
