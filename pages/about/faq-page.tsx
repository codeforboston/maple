import { createPage } from "../../components/page"
import Faq from "../../components/Faq/Faq"
import { createGetStaticTranslationProps } from "components/translations"

export default createPage({
  title: "About",
  Page: () => {
    return <Faq />
  }
})

export const getStaticProps = createGetStaticTranslationProps([
  "auth",
  "common",
  "goalsandmission",
  "footer"
])
