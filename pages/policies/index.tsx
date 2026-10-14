import PolicyPage from "components/Policies/PolicyPage"
import { PoliciesLanding } from "components/Policies/PoliciesLanding"
import { createPage } from "components/page"
import { createGetStaticTranslationProps } from "components/translations"
import { MapleOnly, DigitalDemocracyOnly } from "components/shared/SkinOnly"

/* /policies: under the Maple skin the privacy policy, as on main; under
   Digital Democracy and Mixed a landing page for the three policies. Both
   are rendered and the skin picks one. */
export default createPage({
  titleI18nKey: "titles.policies",
  Page: () => (
    <>
      <MapleOnly>
        <PolicyPage policy="privacy-policy" />
      </MapleOnly>
      <DigitalDemocracyOnly>
        <PoliciesLanding />
      </DigitalDemocracyOnly>
    </>
  )
})

export const getStaticProps = createGetStaticTranslationProps([
  "auth",
  "common",
  "footer",
  "learn",
  "policies",
  "testimony"
])
