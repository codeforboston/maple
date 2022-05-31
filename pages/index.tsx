import React from "react"
import AboutSection from "../components/AboutSection/AboutSection"
import { Button, Col, Container, Row } from "../components/bootstrap"
import HeroHeader from "../components/HeroHeader/HeroHeader"
import Leaf from "../components/Leaf/Leaf"
import { Wrap } from "../components/links"
import { createPage } from "../components/page"
import TestimonyCalloutSection from "../components/TestimonyCallout/TestimonyCalloutSection"
import ViewBillsOnHomePage from "../components/ViewBillsOnHomePage/ViewBillsOnHomePage"

export default createPage({
  Page: () => {
    return (
      <div className="overflow-hidden">
        <HeroHeader />
        <Leaf direction="right" />

        <Container>
          <TestimonyCalloutSection />
        </Container>

        <Leaf direction="left" />

        <Container>
          <AboutSection />
        </Container>

        <Leaf direction="left" />

        <Container>
          <Row className="mt-4">
            <Col xs={12} xl={4} className="text-center">
              <Wrap href="/bills">
                <Button size="lg">View All Bills</Button>
              </Wrap>
              <h4 className="mt-3">Bills with Upcoming Hearings</h4>
              <ViewBillsOnHomePage />
            </Col>
            <Col xs={12} xl={8} className="text-center">
              <Wrap href="/testimonies">
                <Button size="lg">View All Testimony</Button>
              </Wrap>
              <h4 className="mt-3">Most Recent Testimony</h4>
            </Col>
          </Row>
        </Container>
      </div>
    )
  }
})
