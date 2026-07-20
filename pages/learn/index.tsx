import { createPage } from "../../components/page"
import LearnHub from "components/learn/Hub/LearnHub"
import { createGetStaticTranslationProps } from "components/translations"

export default createPage({
  titleI18nKey: "titles.learn_hub",
  Page: () => <LearnHub />
})

export const getStaticProps = createGetStaticTranslationProps([
  "auth",
  "common",
  "footer",
  "learn"
])
