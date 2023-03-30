import { createPage } from "../../components/page"
import ForIndividuals from "../../components/about/ForIndividuals/ForIndividuals"

export default createPage({
  title: "MAPLE for Individuals",
  Page: () => {
    return <ForIndividuals />
  }
})

// this must only be on pages in the pages folder
// it will throw an error if it's in the components folder
import { serverSideTranslations } from "next-i18next/serverSideTranslations"

export async function getStaticProps({ locale }: any) {
  return {
    props: {
      ...(await serverSideTranslations(locale, [
        "common",
        "forindividuals",
        "footer"
      ]))
      // Will be passed to the page component as props
    }
  }
}
