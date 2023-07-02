import { Container } from "components/bootstrap"
import { createPage } from "components/page"
import { TestimonySearch } from "components/search/testimony/TestimonySearch"
import { createGetStaticTranslationProps } from "components/translations"

export default createPage({
  title: "Browse Testimony",
  Page: () => {
    return (
      <Container fluid="md" className="mt-3">
        <h1 className="mb-3">Browse Testimony</h1>
        <TestimonySearch />
      </Container>
    )
  }
})

export const getStaticProps = createGetStaticTranslationProps([
  "auth",
  "common",
  "footer",
  "testimony"
])
