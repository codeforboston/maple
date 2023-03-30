import { createPage } from "../../components/page"
import ForOrgs from "../../components/about/ForOrgs/ForOrgs"

export default createPage({
  title: "MAPLE for Organizations",
  Page: () => {
    return <ForOrgs />
  }
})

// this must only be on pages in the pages folder
// it will throw an error if it's in the components folder
import { serverSideTranslations } from "next-i18next/serverSideTranslations"

export async function getStaticProps({ locale }: any) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "fororgs", "footer"]))
      // Will be passed to the page component as props
    }
  }
}
