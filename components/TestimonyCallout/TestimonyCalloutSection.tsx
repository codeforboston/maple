import { Container, Col, Row } from "react-bootstrap"
import { useRecentTestimony } from "../db"
import TestimonyCallout from "./TestimonyCallout"
import styles from "./TestimonyCallout.module.css"

export default function TestimonyCalloutSection() {
  const recentTestimony = useRecentTestimony(4)

  return (
    <Container>
      <Row className={`${styles.testimonyCalloutSection}`}>
        <Col xs={{ span: 10, offset: 1 }}>
          <h1>What people are saying...</h1>
        </Col>
      </Row>
      <Row>
        <Col xs={{ span: 10, offset: 1 }} xl={{ span: 8, offset: 2 }}>
          <Row
            xs={1}
            md={2}
            lg={2}
            className={`g-4 justify-content-center py-2`}
          >
            {recentTestimony?.map(t => (
              <Col key={t.authorUid + t.billId}>
                <TestimonyCallout key={t.authorUid + t.billId} {...t} />
              </Col>
            ))}
          </Row>
        </Col>
      </Row>
    </Container>
  )
}
