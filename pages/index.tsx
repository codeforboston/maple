import { createPage } from "components/page"
import { createGetStaticTranslationProps } from "components/translations"
import HeroSection from "components/homepage/HeroSection"
import DidYouKnowSection from "components/homepage/DidYouKnowSection"
import ExplainerSection from "components/homepage/ExplainerSection"
import FeaturesSection from "components/homepage/FeaturesSection"
import HearingsSection from "components/homepage/HearingsSection"
import styles from "components/homepage/Homepage.module.css"

export default createPage({
  Page: () => (
    <main className={styles.page}>
      <HeroSection />
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
