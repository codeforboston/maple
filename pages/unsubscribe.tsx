import { createPage } from "../components/page"
import { UnsubscribeConfirm } from "../components/Email/unsubscribe"
import { createGetStaticTranslationProps } from "components/translations"

export default createPage({
  title: "Unsubscribe",
  Page: () => {
    return <UnsubscribeConfirm />
  }
})

export const getStaticProps = createGetStaticTranslationProps([
  "auth",
  "common",
  "footer",
  "testimony",
  "unsubscribe"
])
