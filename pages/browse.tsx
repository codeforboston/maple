import { createPage } from "../components/page"
import ViewTestimony from "../components/ViewBills/ViewBills"
import { Form, Row, Button } from "../components/bootstrap"

export default createPage({
  v2: true,
  title: "Browse",
  Page: () => {
    return (
      <>
        <h1>Browse</h1>

        <SearchBar />
        <ViewTestimony />
      </>
    )
  }
})

const SearchBar = () => (
  <Form className="col-lg-5 mx-auto">
    <Form.Group>
      <Row>
        <Form.Control type="text" placeholder="Search by bill #"></Form.Control>
      </Row>
      <Row className="mt-2">
        <Button variant="primary">Search</Button>
      </Row>
      <Row className="mt-2">
        <Button variant="secondary">Advanced Search</Button>
      </Row>
    </Form.Group>
  </Form>
)
