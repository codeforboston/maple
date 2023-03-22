import { createPage } from "../../components/page"
import ForTestifiers from "../../components/about/ForTestifiers/ForTestifiers"

export default createPage({
  title: "MAPLE for Testifiers",
  Page: () => {
    return <ForTestifiers />
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
        "fortestifiers",
        "footer"
      ]))
      // Will be passed to the page component as props
    }
  }
}
