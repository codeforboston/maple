import { HearingsScheduled } from "components/HearingsScheduled/HearingsScheduled"
import AboutSection from "../components/AboutSection/AboutSection"
import { useAuth } from "../components/auth"
import HeroHeader from "../components/HeroHeader/HeroHeader"
import Leaf from "../components/Leaf/Leaf"
import { createPage } from "../components/page"
import TestimonyCalloutSection from "../components/TestimonyCallout/TestimonyCalloutSection"

export default createPage({
  Page: () => {
    const { authenticated } = useAuth()

    return (
      <div className="overflow-hidden whitebackground">
        <HeroHeader authenticated={authenticated} />

        <Leaf position="firstLeaf" />

        <TestimonyCalloutSection />

        <Leaf position="secondLeaf" />

        <Leaf position="thirdLeaf" />

        <AboutSection />

        <Leaf position="fourthLeaf" />

        <HearingsScheduled />
      </div>
    )
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
        "homepage",
        "footer"
      ]))
      // Will be passed to the page component as props
    }
  }
}
