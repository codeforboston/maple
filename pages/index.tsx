import React from "react"
import { useAuth } from "../components/auth"
import { Button, Stack, Row, Col } from "../components/bootstrap"
import { Wrap } from "../components/links"
import { createPage } from "../components/page"
import ViewBillsOnHomePage from "../components/ViewBillsOnHomePage/ViewBillsOnHomePage"
import TestimoniesOnHomePage from "../components/TestimoniesOnHomePage/TestimoniesOnHomePage"

export default createPage({
  v2: true,
  Page: () => {
    const { authenticated } = useAuth()

    return (
      <>
        <p>
          The Massachusetts Platform for Legislative Engagement (MAPLE) platform
          makes it easier for anyone to submit and see testimony to the{" "}
          <a href="https://malegislature.gov">Massachusetts Legislature</a>{" "}
          about the bills that will shape our future.
        </p>
        <p>
          MAPLE is free to use and open source.{" "}
          <a href="/about">This platform is developed in collaboration</a>{" "}
          between the NuLawLab, Code for Boston, and scholars at the{" "}
          <a href="https://www.bc.edu/bc-web/centers/clough.html">
            BC's Clough Center
          </a>{" "}
          and <a href="https://cyber.harvard.edu">Harvard BKC</a>.
        </p>
        <p>
          This website is not affiliated with the state legislature, but helps
          individuals and organizations to submit their testimony to relevant
          committees and members of the legislature. Because usage of this
          website is voluntary, it will not include 100% of all testimony
          considered by the legislature.
        </p>

        <Stack gap={3} className="col-lg-5 mx-auto">
          {/* <Wrap href="/legprocess">
            <Button size="lg">Learn About Submitting Testimony</Button>
          </Wrap> */}
          {!authenticated && (
            <Wrap href="/login">
              <Button size="lg">Sign Up To Contribute Testimony</Button>
            </Wrap>
          )}
        </Stack>
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
            <TestimoniesOnHomePage />
          </Col>
        </Row>
      </>
    )
  }
})
