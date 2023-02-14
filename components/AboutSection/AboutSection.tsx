import AboutInfoCard from "../AboutSectionInfoCard/AboutInfoCard"
import { Col, Container, Row } from "../bootstrap"
import BackgroundLogo from "../LogoPlacements/BackgroundLogo"
import ScrollTrackerContainer from "../ScrollTrackEffect/ScrollTrackerContainer"
import ScrollTrackingItem from "../ScrollTrackEffect/ScrollTrackerItem"
import styles from "./AboutSection.module.css"
import AboutContent from "./AboutSectionContent.json"

export default function AboutSection() {
  const { who, when, how, why, what } = AboutContent.about

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
            <h1 className="text-white">About MAPLE</h1>
          </Col>
          <Col xs={10} xxl={9}>
            <Row
              xs={1}
              md={2}
              xl={3}
              className={`g-4 justify-content-center py-5`}
            >
              <AboutInfoCard
                title={what.title}
                bodytext={what.bodytext}
              ></AboutInfoCard>
              <AboutInfoCard
                title={why.title}
                bodytext={why.bodytext}
              ></AboutInfoCard>
              <AboutInfoCard
                title={how.title}
                bodytext={how.bodytext}
              ></AboutInfoCard>
              <AboutInfoCard
                title={when.title}
                bodytext={when.bodytext}
              ></AboutInfoCard>
              <AboutInfoCard
                title={who.title}
                bodytext={who.bodytext}
              ></AboutInfoCard>
            </Row>
          </Col>
        </Row>
      </Row>
    </Container>
  )
}
