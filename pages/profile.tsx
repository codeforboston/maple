import React from "react"
import { requireAuth } from "../components/auth"
import * as links from "../components/links"
import { createPage } from "../components/page"
import SelectLegislators from "../components/SelectLegislators"
import MyTestimonies from "../components/MyTestimonies/MyTestimonies"
import { Row, Col, FormControl } from "react-bootstrap"

export default createPage({
  v2: true,
  title: "Profile",
  Page: requireAuth(({ user: { displayName } }) => {
    return (
      <>
        <h1>
          Hello, {displayName ? decodeHtmlCharCodes(displayName) : "Anonymous"}!
        </h1>
        <p>
          Please use the{" "}
          <links.External href="https://malegislature.gov/Search/FindMyLegislator">
            find your legislator
          </links.External>{" "}
          tool and select your State Representative and Senator below.
        </p>
        <Row>
          <Col>
            {" "}
            <SelectLegislators />
          </Col>
          <Col></Col>
        </Row>
        About me:
        <textarea className="form-control col-sm" rows={5} required />
        <div className="form-check">
          <input
            className="form-check-input"
            type="checkbox"
            id="flexCheckChecked"
          />
          <label className="form-check-label" htmlFor="flexCheckChecked">
            Allow others to see my profile
          </label>
        </div>
        <Row className="mt-2">
          <Col>
            <FormControl
              placeholder="Twitter username"
              aria-label="Twitter username"
              aria-describedby="basic-addon1"
            />
          </Col>
          <Col></Col>
          <Col></Col>
        </Row>
        <MyTestimonies />
      </>
    )
  })
})

const decodeHtmlCharCodes = (s: string) =>
  s.replace(/(&#(\d+);)/g, (match, capture, charCode) =>
    String.fromCharCode(charCode)
  )
