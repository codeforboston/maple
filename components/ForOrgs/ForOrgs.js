import { Container, Row, Col } from "../bootstrap"
import AboutPagesCard from "../AboutPagesCard/AboutPagesCard"
import {
  WhyMAPLECardContent,
  BenefitsCardContent
} from "../ForOrgsCardContent/ForOrgsCardContent"

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
        </Col>
      </Row>
    </Container>
  )
}

export default ForOrgs
