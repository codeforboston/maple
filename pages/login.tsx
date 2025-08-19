import { createPage } from "../components/page"
import Login from "components/Login/Login"

export default createPage({
  titleI18nKey: "navigation.login",
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
