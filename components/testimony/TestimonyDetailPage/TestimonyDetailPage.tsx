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
      <Container className="mb-5" fluid="xl">
        <Row className="mt-4 mb-4">
          <BillTitle />
        </Row>

        <Row>
          <Col md={8}>
            <TestimonyDetail />
          </Col>

          <Col md={4}>
            <PolicyActions className="mb-4" />
            <RevisionHistory />
          </Col>
        </Row>
      </Container>
    </>
  )
}
