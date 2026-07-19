import { createPage } from "../../components/page"
import WritingTips from "components/learn/Testimony/WritingTips"
import { createGetStaticTranslationProps } from "components/translations"

export default createPage({
  titleI18nKey: "titles.writing_testimony",
  Page: () => <WritingTips />
})

export const getStaticProps = createGetStaticTranslationProps([
  "auth",
  "common",
  "footer",
  "learn"
])
