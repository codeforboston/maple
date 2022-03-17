import { createPage } from "../components/page"
import { Form, Row, Button } from "../components/bootstrap"
import Testimonies from "../components/Testimonies/Testimonies"

export default createPage({
  v2: true,
  title: "Browse",
  Page: () => {
    return (
      <>
        <h1>Published Testimony</h1>

        <SearchBar />
        <Testimonies />
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
    </Form.Group>
  </Form>
)
