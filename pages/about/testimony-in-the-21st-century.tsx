import { createPage } from "../../components/page"
import { createGetStaticTranslationProps } from "components/translations"
import Testimony21stCentury from "components/about/Testimony21stCentury/Testimony21stCentury"

export default createPage({
  title: "Testimony in the 21st Century",
  Page: () => {
    return (
      <div>
        <Testimony21stCentury />
      </div>
    )
  }
})

export const getStaticProps = createGetStaticTranslationProps([
  "auth",
  "common",
  "footer",
  "testimony21stCentury"
])
