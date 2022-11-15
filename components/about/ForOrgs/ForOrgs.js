import { Container, Row, Col } from "../bootstrap"
import AboutPagesCard from "../AboutPagesCard/AboutPagesCard"
import {
  WhyMAPLECardContent,
  BenefitsCardContent,
  ChallengeCardContent
} from "../about/ForOrgsCardContent/ForOrgsCardContent"

const ForOrgs = () => {
  return (
    <Container>
      <Row>
        <Col>
          <h1 className="fw-bold m-5">MAPLE for Organizations</h1>
          <AboutPagesCard title="Why use MAPLE">
            <WhyMAPLECardContent />
          </AboutPagesCard>
          <AboutPagesCard title="What we offer">
            <BenefitsCardContent />
          </AboutPagesCard>
          <AboutPagesCard title="Rise to the challenge for the 193rd">
            <ChallengeCardContent />
          </AboutPagesCard>
        </Col>
      </Row>
    </Container>
  )
}

export default ForOrgs
