import React from "react"
import AboutSection from "../components/AboutSection/AboutSection"
import { useAuth } from "../components/auth"
import { Button, Col, Row } from "../components/bootstrap"
import HeroHeader from "../components/HeroHeader/HeroHeader"
import Leaf from "../components/Leaf/Leaf"
import { Wrap } from "../components/links"
import { createPage } from "../components/page"
import TestimonyCalloutSection from "../components/TestimonyCallout/TestimonyCalloutSection"
import ViewBillsOnHomePage from "../components/ViewBillsOnHomePage/ViewBillsOnHomePage"

export default createPage({
  v2: true,
  Page: () => {
    const { authenticated } = useAuth()

    return (
      <>
        <HeroHeader authenticated={authenticated} />
        <Leaf direction="right" />

        <TestimonyCalloutSection />

        <Leaf direction="left" />

        <AboutSection />

        <Leaf direction="left" />

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
      </>
    )
  }
})
