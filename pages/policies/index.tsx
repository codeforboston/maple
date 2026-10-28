import { PoliciesLanding } from "components/Policies/PoliciesLanding"
import { createPage } from "components/page"
import { createGetStaticTranslationProps } from "components/translations"

/* /policies: a landing page for the three policies. */
export default createPage({
  titleI18nKey: "titles.policies",
  Page: () => <PoliciesLanding />
})

export const getStaticProps = createGetStaticTranslationProps([
  "auth",
  "common",
  "footer",
  "learn",
  "policies",
  "testimony"
])
