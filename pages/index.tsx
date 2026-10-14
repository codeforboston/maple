import { createPage } from "components/page"
import { createGetStaticTranslationProps } from "components/translations"
import HeroSection from "components/homepage/HeroSection"
import LegacyHeroSection from "components/homepage/legacy/LegacyHeroSection"
import TestimonyCalloutSection from "components/TestimonyCallout/TestimonyCalloutSection"
import DidYouKnowSection from "components/homepage/DidYouKnowSection"
import ExplainerSection from "components/homepage/ExplainerSection"
import FeaturesSection from "components/homepage/FeaturesSection"
import HearingsSection from "components/homepage/HearingsSection"
import styles from "components/homepage/Homepage.module.css"
import { MapleOnly, DigitalDemocracyOnly } from "components/shared/SkinOnly"

export default createPage({
  Page: () => (
    <main className={styles.page}>
      {/* The Maple skin keeps the hero from main; Digital Democracy and Mixed
          get the redesigned one. Both are rendered and the skin picks one, so
          nothing swaps in after the page loads. */}
      <MapleOnly>
        <LegacyHeroSection />
      </MapleOnly>
      <DigitalDemocracyOnly>
        <HeroSection />
      </DigitalDemocracyOnly>
      <TestimonyCalloutSection />
      <DidYouKnowSection />
      <ExplainerSection />
      <FeaturesSection />
      <HearingsSection />
    </main>
  )
})

export const getStaticProps = createGetStaticTranslationProps([
  "auth",
  "common",
  "homepage",
  "footer",
  "testimony"
])
