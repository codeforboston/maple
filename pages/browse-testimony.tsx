import { createPage } from "../components/page"
import BrowseTestimony from "components/BrowseTestimony/BrowseTestimony"

export default createPage({
  title: "Browse Testimony",
  Page: () => {
    return <BrowseTestimony />
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
