import { Container } from "components/bootstrap"
import BrowseTestimony from "components/BrowseTestimony/BrowseTestimony"
import { createPage } from "../components/page"

export default createPage({
  title: "Browse Testimony",
  Page: () => {
    return (
      <Container fluid="md" className="mt-3">
        <h1>Browse Testimony</h1>
        <BrowseTestimony />
      </Container>
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
        "browseTestimony",
        "footer"
      ]))
      // Will be passed to the page component as props
    }
  }
}
