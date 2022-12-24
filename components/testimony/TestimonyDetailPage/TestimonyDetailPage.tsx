import { FC } from "react"
import { Col, Container, Row } from "react-bootstrap"
import { PolicyActions } from "./PolicyActions"
import { RevisionHistory } from "./RevisionHIstory"
import { TestimonyDetail } from "./TestimonyDetail"
import { Title } from "./Title"

export const TestimonyDetailPage: FC = () => {
  return (
    <Container className="mt-3">
      <Row>
        <Title />
      </Row>

      <Row>
        <Col md={8}>
          <TestimonyDetail />
        </Col>

        <Col md={4}>
          <PolicyActions />
          <RevisionHistory />
        </Col>
      </Row>
    </Container>
  )
}
