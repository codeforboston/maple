import AboutPagesCard from "../AboutPagesCard/AboutPagesCard"
import { Col, Container, Row } from "../bootstrap"
import {
  CodeForBostonCardContent,
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
    </Container>
  )
}

export default OurPartners
