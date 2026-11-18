import { createPage } from "../components/page"
import NewsletterSignup from "../components/newsletter/NewsletterSignup"
import { createGetStaticTranslationProps } from "components/translations"

export default createPage({
  titleI18nKey: "titles.newsletter",
  share: {
    titleI18nKey: "titles.newsletter",
    descriptionI18nKey: "newsletter:share_description",
    path: "/newsletter",
    image: "/newsletter-share.png"
  },
  Page: () => <NewsletterSignup />
})

export const getStaticProps = createGetStaticTranslationProps([
  "auth",
  "common",
  "footer",
  "newsletter"
])
