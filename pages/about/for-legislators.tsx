import { createPage } from "../../components/page"
import ForLegislators from "../../components/about/ForLegislators/ForLegislators"

export default createPage({
  title: "MAPLE for Legislators",
  Page: () => {
    return <ForLegislators />
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
        "forlegislators",
        "footer"
      ]))
      // Will be passed to the page component as props
    }
  }
}
