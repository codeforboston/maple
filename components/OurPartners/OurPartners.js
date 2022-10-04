import AboutPagesCard from "../AboutPagesCard/AboutPagesCard"
import { Col, Container, Row } from "../bootstrap"
import {
  BostonCollegeCardContent,
  CodeForBostonCardContent,
  HbkCenterCardContent,
  NuLawLabCardContent
} from "../OurPartnersCardContent/OurPartnersCardContent.tsx"
import styles from "./OurPartners.module.css"

const OurPartners = () => {
  return (
    <Container className={styles.container}>
      <Row className="mt-5 mx-5">
        <Col>
          <h1 className={`fw-bold mb-3 ${styles.header}`}>Our Team</h1>
          <p className={styles.subheader}>
            We are a collective of open source developers, legal scholars, and
            policy analysts & advocates seeking to make the legislative process
            in Massachusetts more accessible and transparent.<br></br>
            <br></br> MAPLE platform is a project of the NuLawLab developed with
            Code for Boston.
          </p>
        </Col>
      </Row>
      <Row>
        <Col>
          <AboutPagesCard title="NuLawLab">
            <NuLawLabCardContent />
          </AboutPagesCard>
        </Col>
      </Row>
      <Row>
        <Col>
          <AboutPagesCard title="Code for Boston">
            <CodeForBostonCardContent />
          </AboutPagesCard>
        </Col>
      </Row>
      <Row className="mx-5">
        <Col>
          <h1 className={`mt-5 fw-bold ${styles.header}`}>Collaborators</h1>
          <p className={styles.subheader}>
            The project is developed in collaboration between the NuLawLab and
            scholars at{" "}
            <a href="https://www.bc.edu/bc-web/schools/law.html">
              Boston College Law School
            </a>{" "}
            and{" "}
            <a href="https://cyber.harvard.edu">
              Harvard University's Berkman Klein Center for Internet & Society
            </a>
            .
          </p>
        </Col>
      </Row>
      <Row>
        <Col>
          <AboutPagesCard title="Boston College Law School">
            <BostonCollegeCardContent />
          </AboutPagesCard>
        </Col>
      </Row>
      <Row>
        <Col>
          <AboutPagesCard title="Harvard Berkman Klein Center">
            <HbkCenterCardContent />
          </AboutPagesCard>
        </Col>
      </Row>
    </Container>
  )
}

export default OurPartners
