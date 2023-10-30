import styled from "styled-components"
import AboutPagesCard from "../AboutPagesCard/AboutPagesCard"
import { Col, Container, Row } from "../bootstrap"
import {
  CodeForBostonCardContent,
  NuLawLabCardContent,
  OpenCollectiveContent
} from "../OurPartnersCardContent/OurPartnersCardContent"
import { PageTitle, PageDescr } from "./CommonComponents"

export const OurPartners = () => {
  return (
    <Container>
      <Row>
        <Col>
          <PageTitle>Our Partners</PageTitle>
        </Col>
      </Row>
      <Row>
        <Col className="py-3">
          <PageDescr>
            The project is developed in partnership between the NuLawLab and
            scholars at{" "}
            <StyleLink
              href="https://www.bc.edu/bc-web/schools/law.html"
              target="_blank"
              rel="noopener noreferrer"
            >
              Boston College Law School
            </StyleLink>{" "}
            and{" "}
            <StyleLink
              href="https://cyber.harvard.edu/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Harvard University's Berkman Klein Center for Internet & Society
            </StyleLink>
            .
          </PageDescr>
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
          <AboutPagesCard title="How to Support Us">
            <Row>
              <OpenCollectiveContent />
            </Row>
          </AboutPagesCard>
        </Col>
      </Row>
    </Container>
  )
}

const StyleLink = styled.a`
  text-decoration: none;
  color: var(--bs-blue);
`
