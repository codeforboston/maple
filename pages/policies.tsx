import { createPage } from "../components/page"
import { Button, Stack } from "react-bootstrap"
import PolicyPage from "components/Policies/PolicyPage"

export default createPage({
  title: "MAPLE for Organizations",
  Page: () => {
    return <PolicyPage />
  }
})

// this must only be on pages in the pages folder
// it will throw an error if it's in the components folder
import { serverSideTranslations } from "next-i18next/serverSideTranslations"

export async function getStaticProps({ locale }: any) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "footer"]))
      // Will be passed to the page component as props
    }
  }
}
