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
