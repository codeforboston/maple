import { createPage } from "../../components/page"
import SupportMaple from "../../components/about/SupportMaple/SupportMaple"
import { createGetStaticTranslationProps } from "components/translations"

export default createPage({
  title: "How to Support MAPLE",
  Page: () => {
    return (
      <div>
        <SupportMaple />
      </div>
    )
  }
})

export const getStaticProps = createGetStaticTranslationProps([
  "auth",
  "common",
  "supportmaple",
  "footer"
])
