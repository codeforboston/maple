import { Container } from "components/bootstrap"
import { createPage } from "components/page"
import { BillSearch } from "components/search"

export default createPage({
  title: "Browse Bills",
  Page: () => {
    return (
      <Container fluid="md" className="mt-3">
        <h1>All Bills</h1>
        <BillSearch />
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
      ...(await serverSideTranslations(locale, ["common", "footer"]))
      // Will be passed to the page component as props
    }
  }
}
