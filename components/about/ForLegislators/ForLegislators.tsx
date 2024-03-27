import { Container, Row, Col } from "../../bootstrap"
import AboutPagesCard from "../../AboutPagesCard/AboutPagesCard"
import {
  WhyMAPLECardContent,
  BenefitsCardContent,
  ChallengeCardContent
} from "../ForLegislatorsCardContent/ForLegislatorsCardContent"
import { useTranslation } from "next-i18next"

const ForLegislators = () => {
  const { t } = useTranslation("forlegislators")

  return (
    <Container>
      <Row>
        <Col>
          <h1 className="fw-bold m-5">{t("title")}</h1>
          <AboutPagesCard title={t("callToAction.header")}>
            <WhyMAPLECardContent />
          </AboutPagesCard>
          <AboutPagesCard title={t("benefits.header")}>
            <BenefitsCardContent />
          </AboutPagesCard>
          <AboutPagesCard title={t("challenge.header")}>
            <ChallengeCardContent />
          </AboutPagesCard>
        </Col>
      </Row>
    </Container>
  )
}

export default ForLegislators
