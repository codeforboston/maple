import React from "react"
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
        <TestimonyCalloutSection />
        <Leaf direction="left" />
        <Container>
          <p className="mt-3">
            The Massachusetts Platform for Legislative Engagement (MAPLE)
            platform makes it easier for anyone to submit and see testimony to
            the{" "}
            <a href="https://malegislature.gov">Massachusetts Legislature</a>{" "}
            about the bills that will shape our future.
          </p>
          <p>
            MAPLE is free to use and open source.{" "}
            <a href="/about">This platform is developed in collaboration</a>{" "}
            between the NuLawLab, Code for Boston, and scholars at{" "}
            <a href="https://www.bc.edu/bc-web/schools/law.html">BC Law</a> and{" "}
            <a href="https://cyber.harvard.edu">Harvard BKC</a>.
          </p>
          <p>
            This website is not affiliated with the state legislature, but helps
            individuals and organizations to submit their testimony to relevant
            committees and members of the legislature. Because usage of this
            website is voluntary, it will not include 100% of all testimony
            considered by the legislature.
          </p>

          <Row className="justify-content-center">
            <Col md={6}>
              <ViewBillsOnHomePage />
            </Col>
          </Row>
          <Row className="justify-content-center mb-3">
            <Col xs="auto">
              <Wrap href="/bills">
                <Button size="lg">View All Bills</Button>
              </Wrap>
            </Col>
          </Row>
        </Container>
      </div>
    )
  }
})
