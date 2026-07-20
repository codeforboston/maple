import { createPage } from "../../components/page"
import LegislativeProcess from "components/learn/Process/LegislativeProcess"
import { createGetStaticTranslationProps } from "components/translations"

export default createPage({
  titleI18nKey: "titles.legislative_process",
  Page: () => <LegislativeProcess />
})

// `learnComponents` stays: AdditionalResources reads its legislative.* keys.
export const getStaticProps = createGetStaticTranslationProps([
  "auth",
  "common",
  "footer",
  "learn",
  "learnComponents"
])
