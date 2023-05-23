import { createPage } from "../../components/page"
import ForOrgs from "../../components/about/ForOrgs/ForOrgs"
import { createGetStaticTranslationProps } from "components/translations"

export default createPage({
  title: "MAPLE for Organizations",
  Page: () => {
    return <ForOrgs />
  }
})

export const getStaticProps = createGetStaticTranslationProps([
  "auth",
  "common",
  "fororgs",
  "footer",
  "testimony"
])
