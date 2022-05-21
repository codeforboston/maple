import { Container, Col, Row } from "react-bootstrap"
import { useRecentTestimony } from "../db"
import TestimonyCallout from "./TestimonyCallout"

export default function TestimonyCalloutSection() {
  const recentTestimony = useRecentTestimony(4)

  return (
    <Container>
      <Row>
        <Col xs={{ span: 10 }} className="m-auto">
          <Row>
            <h1>What people are saying...</h1>
          </Row>
          <Row xs={1} lg={2} className="m-auto">
            {recentTestimony?.map(t => (
              <TestimonyCallout key={t.authorUid + t.billId} {...t} />
            ))}
          </Row>
        </Col>
      </Row>
    </Container>
  )
}
