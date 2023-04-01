import { createPage } from "../../components/page"
import SupportMaple from "../../components/about/SupportMaple/SupportMaple"

export default createPage({
  title: "How to Support MAPLE",
  Page: () => {
    return (
      <div>
        <SupportMaple />
      </div>
    )
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
        "supportmaple",
        "footer"
      ]))
      // Will be passed to the page component as props
    }
  }
}
