import { Container, Row, Col } from "../../bootstrap"
import AboutPagesCard from "../../AboutPagesCard/AboutPagesCard"
import {
  WhyMAPLECardContent,
  BenefitsCardContent,
  ChallengeCardContent
} from "../ForOrgsCardContent/ForOrgsCardContent"
import { useTranslation } from "next-i18next"

const ForOrgs = () => {
  
  const {t} = useTranslation("fororgs")
  
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
          <AboutPagesCard title={t('challenge.title')}>
            <ChallengeCardContent />
          </AboutPagesCard>
        </Col>
      </Row>
    </Container>
  )
}

export default ForOrgs
