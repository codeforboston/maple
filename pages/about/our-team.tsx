import { createPage } from "../../components/page"
import { createGetStaticTranslationProps } from "components/translations"
import { OurTeam } from "../../components/OurTeam/OurTeam"

export default createPage({
  title: "Our Team",
  Page: () => {
    return (
      <div>
        <OurTeam />
      </div>
    )
  }
})

export const getStaticProps = createGetStaticTranslationProps([
  "auth",
  "common",
  "footer"
])
