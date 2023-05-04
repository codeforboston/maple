import { createPage } from "../../components/page"
import ForLegislators from "../../components/about/ForLegislators/ForLegislators"
import { createGetStaticTranslationProps } from "components/translations"

export default createPage({
  title: "MAPLE for Legislators",
  Page: () => {
    return <ForLegislators />
  }
})

export const getStaticProps = createGetStaticTranslationProps([
  "common",
  "forlegislators",
  "footer"
])
