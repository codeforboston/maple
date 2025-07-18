import { createPage } from "../components/page"
import { UnsubscribeConfirm } from "../components/Email/unsubscribe"
import { createGetStaticTranslationProps } from "components/translations"

export default createPage({
  title: "Login",
  Page: () => {
    return <div>Hello World</div>
  }
})

export const getStaticProps = createGetStaticTranslationProps([
  "auth",
  "common",
  "footer"
])
