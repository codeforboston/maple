import React from "react"
import { useAuth } from "../components/auth"
import { Button, Stack, Row, Col } from "../components/bootstrap"
import { Wrap } from "../components/links"
import { createPage } from "../components/page"
import ViewBillsOnHomePage from "../components/ViewBillsOnHomePage/ViewBillsOnHomePage"
import TestimonyCalloutSection from "../components/TestimonyCallout/TestimonyCalloutSection"
import TestimoniesOnHomePage from "../components/TestimoniesOnHomePage/TestimoniesOnHomePage"
import AboutSection from "../components/AboutSection/AboutSection"
import HeroHeader from "../components/HeroHeader/HeroHeader"
import TestimonyDisplay from "../components/TestimonyDisplay/TestimonyDisplay"
import Leaf from "../components/Leaf/Leaf"

export default createPage({
  v2: true,
  Page: () => {
    const { authenticated } = useAuth()

    return (
      <>
        <HeroHeader />
        <Leaf direction="right" />
        <Row>
          <TestimonyCalloutSection />
        </Row>
        <Leaf direction="left" />

        <Stack gap={3} className="col-lg-5 mx-auto">
          {!authenticated && (
            <Wrap href="/login">
              <Button size="lg">Sign Up To Contribute Testimony</Button>
            </Wrap>
          )}
        </Stack>

        <AboutSection />
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
