import { Container, Row, Col } from "../bootstrap"
import AboutPagesCard from "../AboutPagesCard/AboutPagesCard"
import {
  OurGoalsCardContent,
  OurMissionCardContent
} from "../GoalsAndMissionCardContent/GoalsAndMissionCardContent"
import styled from "styled-components"

const Container_GM = styled(Container)`
  .card:nth-child(2) .card-body {
    padding: 0 2.5rem;
  }

  .card:nth-child(2) .col {
    padding: 0 1.5rem;
  }

  .card:nth-child(3) .card-body {
    padding: 0 6rem;
  }

  .card:nth-child(3) .row:nth-child(2) :not(.text-center) {
    flex-basis: 30%;
  }

  .card:nth-child(3) .row:nth-child(3) .text-end {
    flex-basis: 30%;
  }

`

const GoalsAndMission = () => {
  return (
    <Container_GM>
      <Row>
        <Col>
          <h1 className="fw-bold m-5">Our Goals &amp; Mission</h1>
          <AboutPagesCard title="Our Goals">
            <OurGoalsCardContent />
          </AboutPagesCard>
          <AboutPagesCard title="Our Mission">
            <OurMissionCardContent />
          </AboutPagesCard>
        </Col>
      </Row>
    </Container_GM>
  )
}

export default GoalsAndMission
