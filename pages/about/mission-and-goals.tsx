import { createPage } from "../../components/page"
import GoalsAndMission from "../../components/GoalsAndMission/GoalsAndMission"
import { createGetStaticTranslationProps } from "components/translations"

export default createPage({
  title: "About",
  Page: () => {
    return <GoalsAndMission />
  }
})

export const getStaticProps = createGetStaticTranslationProps([
  "auth",
  "common",
  "goalsandmission",
  "footer"
])
