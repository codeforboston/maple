import { createPage } from "../../components/page"
import OurPartners from "../../components/OurPartners/OurPartners"
import { createGetStaticTranslationProps } from "components/translations"

export default createPage({
  title: "Our Team",
  Page: () => {
    return (
      <div>
        <OurPartners />
      </div>
    )
  }
})

export const getStaticProps = createGetStaticTranslationProps([
  "common",
  "footer"
])
