import { HearingsScheduled } from "components/HearingsScheduled/HearingsScheduled"
import AboutSection from "../components/AboutSection/AboutSection"
import { useAuth } from "../components/auth"
import HeroHeader from "../components/HeroHeader/HeroHeader"
import Leaf from "../components/Leaf/Leaf"
import { createPage } from "../components/page"
import TestimonyCalloutSection from "../components/TestimonyCallout/TestimonyCalloutSection"
import { createGetStaticTranslationProps } from "components/translations"

export default createPage({
  Page: () => {
    const { authenticated } = useAuth()

    return (
      <div className="overflow-hidden whitebackground">
        <HeroHeader authenticated={authenticated} />

        <Leaf position="first" />

        <TestimonyCalloutSection />

        <Leaf position="second" />

        <Leaf position="third" />

        <AboutSection />

        <Leaf position="fourth" />

        <HearingsScheduled />
      </div>
    )
  }
})

export const getStaticProps = createGetStaticTranslationProps([
  "auth",
  "common",
  "homepage",
  "footer",
  "testimony"
])
