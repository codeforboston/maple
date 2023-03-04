import AboutPagesCard from "../AboutPagesCard/AboutPagesCard"
import { Col, Container, Row } from "../bootstrap"
import {
  CodeForBostonCardContent,
  NuLawLabCardContent
} from "../OurPartnersCardContent/OurPartnersCardContent.tsx"
import styles from "./OurPartners.module.css"

import Partners from "./OurPartnersTextContent.json"

const OurPartners = () => {
  const { title, team, hosts, supporters } = Partners.partners

  return (
    <Container className={styles.container}>
      <Row className="mt-5 mx-5">
        <Col>
          <h1 className={`fw-bold mb-3 ${styles.header}`}>{team.title}</h1>
          <p className={styles.subheader}>
            {team.bodytext}
            <br></br>
            <br></br>
            {hosts.bodytext}
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
      <Row>
        <Col>
          <AboutPagesCard title={supporters.title}>
            <Row>
              <p className={styles.content}>{supporters.bodytext}</p>
            </Row>
          </AboutPagesCard>
        </Col>
      </Row>
    </Container>
  )
}

export default OurPartners
