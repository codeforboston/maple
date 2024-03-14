import { createPage } from "../../components/page"
import { FaqPage } from "../../components/Faq/FaqPage"
import { createGetStaticTranslationProps } from "components/translations"

export default createPage({
  title: "About",
  Page: () => {
    return <FaqPage />
  }
})

export const getStaticProps = createGetStaticTranslationProps([
  "auth",
  "common",
  "goalsandmission",
  "footer"
])
