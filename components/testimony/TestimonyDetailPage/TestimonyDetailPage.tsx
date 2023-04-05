import { FC } from "react"
import { Col, Container, Row } from "react-bootstrap"
import { BillTitle } from "./BillTitle"
import { PolicyActions } from "./PolicyActions"
import { RevisionHistory } from "./RevisionHistory"
import { useCurrentTestimonyDetails } from "./testimonyDetailSlice"
import { TestimonyDetail } from "./TestimonyDetail"
import { VersionBanner } from "./TestimonyVersionBanner"
import { useAuth } from "components/auth"

export const TestimonyDetailPage: FC = () => {
  const { authorUid } = useCurrentTestimonyDetails()
  const { user } = useAuth()
  const isUser = user?.uid === authorUid
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
            <PolicyActions className="mb-4" isUser={isUser} />
            <RevisionHistory />
          </Col>
        </Row>
      </Container>
    </>
  )
}
