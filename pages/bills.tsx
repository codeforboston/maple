import { Container } from "../components/bootstrap"
import { createPage } from "../components/page"
import { InstantSearch } from "../components/search"

export default createPage({
  title: "Browse Bills",
  Page: () => {
    return (
      <Container className="mt-3">
        <h1>All Bills</h1>
        <h3>Current session, 2021-2022</h3>
        <InstantSearch />
      </Container>
    )
  }
})
