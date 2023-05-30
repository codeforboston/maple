import { createPage } from "../../components/page"
import ForIndividuals from "../../components/about/ForIndividuals/ForIndividuals"
import { createGetStaticTranslationProps } from "components/translations"

export default createPage({
  title: "MAPLE for Individuals",
  Page: () => {
    return <ForIndividuals />
  }
})

export const getStaticProps = createGetStaticTranslationProps([
  "auth",
  "common",
  "forindividuals",
  "footer",
  "testimony"
])
