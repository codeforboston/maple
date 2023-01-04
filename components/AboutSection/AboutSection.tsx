import AboutInfoCard from "../AboutSectionInfoCard/AboutInfoCard"
import { Col, Container, Row } from "../bootstrap"
import BackgroundLogo from "../LogoPlacements/BackgroundLogo"
import ScrollTrackerContainer from "../ScrollTrackEffect/ScrollTrackerContainer"
import ScrollTrackingItem from "../ScrollTrackEffect/ScrollTrackerItem"
import styles from "./AboutSection.module.css"

export default function AboutSection() {
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
                title="Who"
                bodytext="Anyone can submit testimony to the MA legislature. Testimony from MA residents is typically directed to the committee leading the bill and your district House and Senate legislators."
              ></AboutInfoCard>
              <AboutInfoCard
                title="When"
                bodytext="MAPLE welcomes testimony at any time, but we recommend submitting your testimony before the scheduled hearing date for the greatest impact. The relevant committee dates are listed on the bill pages of this website. "
              ></AboutInfoCard>
              <AboutInfoCard
                title="Why"
                bodytext="Let your legislators know how you feel about an issue, so policymakers can make better informed decisions about the laws that govern all our lives."
              ></AboutInfoCard>
              <AboutInfoCard
                title="Where"
                bodytext="Testimony is generally accepted by sending an email to the committee Chairs. The MAPLE website will help you easily find a bill you want to testify in and draft an email to send to the relevant personnel."
              ></AboutInfoCard>
              <AboutInfoCard
                title="What"
                bodytext="Your testimony will be most impactful when it feels distinctive and relevant, so be sure to write your own text and explain why you are interested in an issue.            "
              ></AboutInfoCard>
            </Row>
          </Col>
        </Row>
      </Row>
    </Container>
  )
}
