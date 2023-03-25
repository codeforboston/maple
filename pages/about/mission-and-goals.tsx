import { createPage } from "../../components/page"
import GoalsAndMission from "../../components/GoalsAndMission/GoalsAndMission"

export default createPage({
  title: "About",
  Page: () => {
    return <GoalsAndMission />
  }
})

// this must only be on pages in the pages folder
// it will throw an error if it's in the components folder

import { serverSideTranslations } from "next-i18next/serverSideTranslations"

export async function getStaticProps({ locale }: any) {
  return {
    props: {
      ...(await serverSideTranslations(locale, [
        "common",
        "goalsandmission",
        "footer"
      ]))
      // Will be passed to the page component as props
    }
  }
}
