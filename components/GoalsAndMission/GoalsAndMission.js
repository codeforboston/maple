import { Container, Row, Col } from "../bootstrap"
import AboutPagesCard from "../AboutPagesCard/AboutPagesCard"
import {
  OurGoalsCardContent,
  OurMissionCardContent
} from "../GoalsAndMissionCardContent/GoalsAndMissionCardContent"

const GoalsAndMission = () => {
  return (
    <Container>
      <Row>
        <Col>
          <h1 className="fw-bold m-5">Our Mission &amp; Goals</h1>
          <AboutPagesCard title="Our Mission">
            <OurMissionCardContent />
          </AboutPagesCard>
          <AboutPagesCard title="Our Goals">
            <OurGoalsCardContent />
          </AboutPagesCard>
        </Col>
      </Row>
    </Container>
  )
}

export default GoalsAndMission
