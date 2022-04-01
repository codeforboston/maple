import React, { useState } from "react"
import { requireAuth } from "../components/auth"
import { useProfile } from "../components/db"
import * as links from "../components/links"
import { createPage } from "../components/page"
import SelectLegislators from "../components/SelectLegislators"
import MyTestimonies from "../components/MyTestimonies/MyTestimonies"
import { Row, Col, FormControl, Form, Spinner } from "react-bootstrap"

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

export default createPage({
  v2: true,
  title: "Profile",
  Page: requireAuth(({ user: { displayName } }) => {
    const profile = useProfile()
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

        <div className="form-check mt-3 mb-2">
          <input
            className="form-check-input"
            type="checkbox"
            id="flexCheckChecked"
            checked={profile.profile?.public ?? true} // default is true
            onChange={e => {
              profile.updateIsPublic(e.target.checked)
            }}
          />
          <label className="form-check-label" htmlFor="flexCheckChecked">
            Allow others to see my profile&nbsp;
          </label>
          {profile.updatingIsPublic ? (
            <Spinner animation="border" className="mx-auto" size="sm" />
          ) : null}
        </div>

        <MyTestimonies />
      </>
    )
  })
})

const decodeHtmlCharCodes = (s: string) =>
  s.replace(/(&#(\d+);)/g, (match, capture, charCode) =>
    String.fromCharCode(charCode)
  )
