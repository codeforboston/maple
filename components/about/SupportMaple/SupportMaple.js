import { Container, Row, Col } from "../../bootstrap"
import AboutPagesCard from "../../AboutPagesCard/AboutPagesCard"
import {
  DonateCardContent,
  VolunteerCardContent,
  FeedbackCardContent,
  UseMAPLECardContent
} from "../SupportMapleCardContent/SupportMapleCardContent"
import { useTranslation } from "next-i18next"

const SupportMaple = () => {
  const { t } = useTranslation("supportmaple")

  return (
    <Container>
      <Row>
        <Col>
          <h1 className="fw-bold m-5">{t("title")}</h1>
          <AboutPagesCard title={t("donate.header")}>
            <DonateCardContent />
          </AboutPagesCard>
          <AboutPagesCard title={t("volunteer.header")}>
            <VolunteerCardContent />
          </AboutPagesCard>
          <AboutPagesCard title={t("feedback.header")}>
            <FeedbackCardContent />
          </AboutPagesCard>
          <AboutPagesCard title={t("useMAPLE.header")}>
            <UseMAPLECardContent />
          </AboutPagesCard>
        </Col>
      </Row>
    </Container>
  )
}

export default SupportMaple
