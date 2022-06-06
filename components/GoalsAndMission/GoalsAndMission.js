import { Container, Row, Col } from "../bootstrap"
import AboutPagesCard from "../AboutPagesCard/AboutPagesCard"
import GoalsAndMissionCardContent from "../OurGoalsAndMissionCardContent/OurGoalsCardContent"
import styles from "../GoalsAndMission/GoalsAndMission.module.css"

const GoalsAndMission = () => {
  return (
    <Container fluid className={styles.container}>
      <Row>
        <Col>
          <h1 className="mt-5 fw-bold">Our Goals and Mission</h1>
          <AboutPagesCard body={GoalsAndMissionCardContent} title="Our Goals" />
        </Col>
      </Row>
    </Container>
  )
}

export default GoalsAndMission
