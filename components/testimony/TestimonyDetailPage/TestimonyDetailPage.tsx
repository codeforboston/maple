import { FC } from "react"
import { Col, Container, Row } from "react-bootstrap"
import { BillTitle } from "./BillTitle"
import { PolicyActions } from "./PolicyActions"
import { RevisionHistory } from "./RevisionHistory"
import { TestimonyDetail } from "./TestimonyDetail"
import { VersionBanner } from "./TestimonyVersionBanner"

export const TestimonyDetailPage: FC = () => {
  return (
    <>
      <VersionBanner fluid="xl" />
      <Container fluid="xl">
        <Row className="mt-3">
          <BillTitle />
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
    </>
  )
}
