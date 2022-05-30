import { Button, Col, Container, Row } from "../bootstrap"
import { useRecentTestimony } from "../db"
import { Wrap } from "../links"
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
      <Row className="justify-content-center">
        <Col xs="auto">
          <Wrap href="/testimonies">
            <Button size="lg">View All Testimony</Button>
          </Wrap>
        </Col>
      </Row>
    </Container>
  )
}
