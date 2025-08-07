import { HearingDetails } from "components/hearing/HearingDetails"
import { createPage } from "../../components/page"
import { createGetStaticTranslationProps } from "components/translations"

export default createPage({
  title: "Hearing",
  Page: () => {
    return <HearingDetails />
  }
})

export const getStaticProps = createGetStaticTranslationProps([
  "auth",
  "common",
  "footer"
])
