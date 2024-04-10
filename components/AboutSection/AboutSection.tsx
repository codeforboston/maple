import styled from "styled-components"
import AboutInfoCard from "../AboutSectionInfoCard/AboutInfoCard"
import { Col, Container, Row } from "../bootstrap"
import BackgroundLogo from "../LogoPlacements/BackgroundLogo"
import ScrollTrackerContainer from "../ScrollTrackEffect/ScrollTrackerContainer"
import ScrollTrackingItem from "../ScrollTrackEffect/ScrollTrackerItem"
import { useTranslation } from "next-i18next"

const AngledTopRow = styled(Row)`
  padding-top: 10em;
  padding-bottom: 8em;
  z-index: 1;
  clip-path: polygon(0 10%, 100% 0, 100% 100%, 0 100%);
`

export default function AboutSection() {
  const { t } = useTranslation("homepage")

  return (
    <Container fluid>
      <AngledTopRow className="position-relative h-auto bg-secondary overflow-hidden">
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
      </AngledTopRow>
    </Container>
  )
}
