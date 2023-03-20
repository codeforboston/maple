import AboutInfoCard from "../AboutSectionInfoCard/AboutInfoCard"
import { Col, Container, Row } from "../bootstrap"
import BackgroundLogo from "../LogoPlacements/BackgroundLogo"
import ScrollTrackerContainer from "../ScrollTrackEffect/ScrollTrackerContainer"
import ScrollTrackingItem from "../ScrollTrackEffect/ScrollTrackerItem"
import styles from "./AboutSection.module.css"
import { useTranslation } from "next-i18next"

export default function AboutSection() {
  const { t } = useTranslation("homepage")

  return (
    <Container fluid>
      <Row className={`${styles.angledTop}`}>
        <Row className="justify-content-center">
          <ScrollTrackerContainer>
            <ScrollTrackingItem speed={0.5}>
              <BackgroundLogo />
            </ScrollTrackingItem>
          </ScrollTrackerContainer>

          <Col xs={10}>
            <h1 className="text-white">{t("About_MAPLE")}</h1>
          </Col>
          <Col xs={10} xxl={9}>
            <Row
              xs={1}
              md={2}
              xl={3}
              className={`g-4 justify-content-center py-5`}
            >
              <AboutInfoCard
                title={t("what.title")}
                bodytext={t("what.bodytext")}
              ></AboutInfoCard>
              <AboutInfoCard
                title={t("why.title")}
                bodytext={t("why.bodytext")}
              ></AboutInfoCard>
              <AboutInfoCard
                title={t("how.title")}
                bodytext={t("how.bodytext")}
              ></AboutInfoCard>
              <AboutInfoCard
                title={t("when.title")}
                bodytext={t("when.bodytext")}
              ></AboutInfoCard>
              <AboutInfoCard
                title={t("who.title")}
                bodytext={t("who.bodytext")}
              ></AboutInfoCard>
            </Row>
          </Col>
        </Row>
      </Row>
    </Container>
  )
}
