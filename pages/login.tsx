import LoginPage from "components/Login/login"
import { createPage } from "../components/page"
import { createGetStaticTranslationProps } from "components/translations"

export default createPage({
  title: "Login",
  Page: () => {
    return <LoginPage />
  }
})

export const getStaticProps = createGetStaticTranslationProps([
  "auth",
  "common",
  "footer"
])
