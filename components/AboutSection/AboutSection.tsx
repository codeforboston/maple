import { Container, Row, Col, Image } from "react-bootstrap"
import AboutInfoCard from "../AboutSectionInfoCard/AboutInfoCard"
import BackgroundLogo from "../LogoPlacements/BackgroundLogo"
import styles from "./AboutSection.module.css"

export default function AboutSection() {
  return (
    <Container fluid>
      <Row className={`${styles.angledTop}`}>
        <Row>
          <Col xs={{ span: 10, offset: 1 }} md={{ span: 4, offset: 1 }}>
            <h2 className="text-white text-nowrap text-center">About MAPLE</h2>
          </Col>
        </Row>
        <Row
          xs={1}
          md={2}
          lg={3}
          className={`g-4 justify-content-center w-75 m-auto py-5`}
        >
          <BackgroundLogo />
          <AboutInfoCard
            title="Who"
            bodytext="Anyone can submit testimony to the MA legislature. Legislators tend to value testimony most when it comes from their own constituents, so testimony from MA residents is typically directed to both the committee that is substantively responsible for the bill as well as the legislators (House member and Senator) representing your district."
          ></AboutInfoCard>
          <AboutInfoCard
            title="When"
            bodytext="Committees generally accept testimony up until the hearing date designated for a bill. You can use the bill pages on this website to identify relevant committee dates. Although some committees will accept testimony after this date, for the greatest impact you should submit your testimony before the hearing."
          ></AboutInfoCard>
          <AboutInfoCard
            title="Why"
            bodytext="The key role of testimony is to let your legislators know how you feel about an issue. If you don't share your perspective, it may not be taken into account when policymakers make decisions about the laws that govern all our lives."
          ></AboutInfoCard>
          <AboutInfoCard
            title="Where"
            bodytext="Testimony is generally accepted by committees of the legislature by sending an email to their Chairs. This website, MAPLE, will help you to do this by making it easy to find a bill you want to testify in and then generate an email, which you fully control, which you can then send to the relevant personnel."
          ></AboutInfoCard>
          <AboutInfoCard
            title="What"
            bodytext="Your testimony will be most impactful when it feels distinctive and relevant, so be sure to write your own text and explain why you are interested in an issue.            "
          ></AboutInfoCard>
        </Row>
      </Row>
    </Container>
  )
}
