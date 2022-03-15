import { Form, Row, Button } from "../../components/bootstrap"

const SearchBar = () => {
  return (
    <Form className="col-lg-5 mx-auto">
      <Form.Group>
        <Row>
          <Form.Control
            type="text"
            placeholder="Search by bill #"
          ></Form.Control>
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
}

export default SearchBar
