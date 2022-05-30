import { Container } from "../components/bootstrap"
import { createPage } from "../components/page"
import ViewBills from "../components/ViewBills/ViewBills"

export default createPage({
  title: "Browse Bills",
  Page: () => {
    return (
      <Container className="mt-3">
        <h1>All Bills</h1>
        <h3>Current session, 2021-2022</h3>
        <ViewBills />
      </Container>
    )
  }
})
