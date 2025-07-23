import { createPage } from "../components/page"
import Login from "components/Login/login"

export default createPage({
  title: "Login",
  Page: () => <Login />
})
import { serverSideTranslations } from "next-i18next/serverSideTranslations"
export async function getStaticProps({ locale }: any) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["auth", "common"]))
    }
  }
}