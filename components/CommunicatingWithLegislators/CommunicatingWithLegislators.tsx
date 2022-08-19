import { Container, Row, Col } from "../bootstrap"
import AboutPagesCard from "../AboutPagesCard/AboutPagesCard"
import {
  WritingContent,
  OralContent,
  WriteOrCallContent
} from "./CommunicatingWithLegislatorsContent"

const CommunicatingWithLegislators = () => {
  return (
    <Container>
      <Row>
        <Col>
          <h1 className="fw-bold m-5">Communicating with Legislators</h1>
          <p>
            There are multiple ways for you to voice your opinion to your
            legislators.
          </p>
          <AboutPagesCard title="Testify in writing">
            <WritingContent />
          </AboutPagesCard>
          <AboutPagesCard title="Testify orally">
            <OralContent />
          </AboutPagesCard>
          <AboutPagesCard title="Write or call them">
            <WriteOrCallContent />
          </AboutPagesCard>
        </Col>
      </Row>
    </Container>
  )
}

export default CommunicatingWithLegislators
