import React, { useState } from "react"
import { requireAuth } from "../components/auth"
import * as links from "../components/links"
import { createPage } from "../components/page"
import SelectLegislators from "../components/SelectLegislators"
import MyTestimonies from "../components/MyTestimonies/MyTestimonies"
import { Row, Col, FormControl, Form } from "react-bootstrap"
import { connectStorageEmulator } from "firebase/storage"

const showLegislators = (
  <>
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
  </>
)

const socialMedia = (
  <Row className="mt-3">
    <Col>
      <FormControl
        placeholder="Twitter username"
        aria-label="Twitter username"
        aria-describedby="basic-addon1"
      />
    </Col>
    <Col>
      <FormControl
        placeholder="LinkedIn username"
        aria-label="LinkedIn username"
        aria-describedby="basic-addon1"
      />
    </Col>
    <Col></Col>
  </Row>
)

const privacy = (
  <div className="form-check mt-3 mb-2">
    <input
      className="form-check-input"
      type="checkbox"
      id="flexCheckChecked"
      defaultChecked={true}
      // checked={true}  // complete when OnChange is ready
    />
    <label className="form-check-label" htmlFor="flexCheckChecked">
      Allow others to see my profile
    </label>
  </div>
)

export default createPage({
  v2: true,
  title: "Profile",
  Page: requireAuth(({ user: { displayName } }) => {
    const [entity, setEntity] = useState("individual")
    const makeOrganization = () => {
      setEntity("organization")
    }
    const makeIndividual = () => {
      setEntity("individual")
    }
    const individual = entity == "individual"
    return (
      <>
        <h1>
          Hello, {displayName ? decodeHtmlCharCodes(displayName) : "Anonymous"}!
        </h1>
        <div key={`inline-radio`} className="mb-3">
          <div>Are you an individual or an organization?</div>
          <Form.Check
            inline
            label="Individual"
            name="individualOrOrganization"
            type="radio"
            id="individual"
            defaultChecked
            onChange={makeIndividual}
          />
          <Form.Check
            inline
            label="Organization"
            name="individualOrOrganization"
            type="radio"
            id="organization"
            onChange={makeOrganization}
          />
        </div>
        {individual && showLegislators}
        {individual ? "About me:" : "About this organization:"}
        <textarea className="form-control col-sm" rows={5} required />
        {individual && socialMedia}
        {individual && privacy}
        <MyTestimonies />
      </>
    )
  })
})

const decodeHtmlCharCodes = (s: string) =>
  s.replace(/(&#(\d+);)/g, (match, capture, charCode) =>
    String.fromCharCode(charCode)
  )
