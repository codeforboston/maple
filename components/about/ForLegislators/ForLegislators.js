import { Container, Row, Col } from "../bootstrap"
import AboutPagesCard from "../../AboutPagesCard/AboutPagesCard"
import {
  WhyMAPLECardContent,
  BenefitsCardContent,
  ChallengeCardContent
} from "../ForLegislatorsCardContent/ForLegislatorsCardContent"

const ForLegislators = () => {
  return (
    <Container>
      <Row>
        <Col>
          <h1 className="fw-bold m-5">MAPLE for Legislators</h1>
          <AboutPagesCard title="Why use MAPLE">
            <WhyMAPLECardContent />
          </AboutPagesCard>
          <AboutPagesCard title="What we offer">
            <BenefitsCardContent />
          </AboutPagesCard>
          <AboutPagesCard title="Get started with MAPLE!">
            <ChallengeCardContent />
          </AboutPagesCard>
        </Col>
      </Row>
    </Container>
  )
}

export default ForLegislators
