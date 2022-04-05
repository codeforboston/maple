import React, { useEffect, useState } from "react"
import { requireAuth } from "../components/auth"
import { SocialLinks, SOCIAL_NETWORKS, useProfile } from "../components/db"
import * as links from "../components/links"
import { createPage } from "../components/page"
import SelectLegislators from "../components/SelectLegislators"
import MyTestimonies from "../components/MyTestimonies/MyTestimonies"
import { useRouter } from "next/router"
import { useAuth } from "../components/auth"
import {
  Row,
  Col,
  FormControl,
  Form,
  Spinner,
  InputGroup,
  Button
} from "react-bootstrap"

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

/** Mapping from social network to UI name for it */
const SOCIAL_NAMES = {
  linkedIn: "LinkedIn",
  twitter: "Twitter"
} as const

const useEffectWithTimeout = (
  effect: () => void,
  deps?: React.DependencyList
) => {
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      effect()
    }, 400)
    return () => {
      clearTimeout(timeoutId)
    }
  }, deps)
}

export default createPage({
  v2: true,
  title: "Profile",
  Page: requireAuth(({ user: { displayName } }) => {
    const profile = useProfile()

    const { user } = useAuth()
    const uid = user?.uid

    const [entity, setEntity] = useState("individual")
    const makeOrganization = () => {
      setEntity("organization")
    }
    const makeIndividual = () => {
      setEntity("individual")
    }
    const individual = entity == "individual"
    const router = useRouter()

    // Have unsaved text inputs separate from profile
    // so we don't ping the server every keystroke
    const [unsavedSocials, setUnsavedSocials] = useState<SocialLinks>({})
    const [unsavedAbout, setUnsavedAbout] = useState<string>()

    useEffect(() => {
      // Load in text inputs when profile loads
      setUnsavedSocials(profile.profile?.social ?? {})
      setUnsavedAbout(profile.profile?.about)
    }, [profile.profile])

    useEffectWithTimeout(() => {
      // Wait a bit for user input to stop, then save socials
      if (profile.loading || !profile?.profile) {
        return
      }
      for (const network of SOCIAL_NETWORKS) {
        const unsavedLink = unsavedSocials[network]
        if (
          unsavedLink !== undefined &&
          profile.profile.social?.[network] !== unsavedLink
        ) {
          profile.updateSocial(network, unsavedLink)
        }
      }
    }, [unsavedSocials, profile])

    useEffectWithTimeout(() => {
      // Wait a bit for user input to stop, then save "About me"
      if (profile.loading || !profile?.profile) {
        return
      }
      if (
        unsavedAbout !== undefined &&
        unsavedAbout !== profile.profile.about
      ) {
        profile.updateAbout(unsavedAbout)
      }
    }, [unsavedAbout, profile])

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
        <div>
          {individual ? "About me:" : "About this organization:"}{" "}
          {profile.updatingAbout ? (
            <Spinner animation="border" className="mx-auto" size="sm" />
          ) : null}
        </div>
        <textarea
          className="form-control col-sm"
          rows={5}
          value={unsavedAbout}
          onChange={e => {
            setUnsavedAbout(e.currentTarget.value)
          }}
          required
        />
        {
          <Row className="mt-3">
            {SOCIAL_NETWORKS.map(network => (
              <Col key={network}>
                {`${SOCIAL_NAMES[network]} Username`}
                <InputGroup>
                  <FormControl
                    placeholder={`${SOCIAL_NAMES[network]} username`}
                    aria-label={`${SOCIAL_NAMES[network]} username`}
                    aria-describedby="basic-addon1"
                    value={unsavedSocials[network] ?? ""}
                    onChange={e => {
                      const newValue = e.currentTarget.value
                      setUnsavedSocials(oldUnsavedSocials => ({
                        ...oldUnsavedSocials,
                        [network]: newValue
                      }))
                    }}
                  />
                  {profile.updatingSocial[network] ? (
                    <InputGroup.Text>
                      <Spinner
                        animation="border"
                        className="mx-auto"
                        size="sm"
                      />
                    </InputGroup.Text>
                  ) : null}
                </InputGroup>
              </Col>
            ))}
          </Row>
        }
        {individual && (
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
              Allow others to see my profile
            </label>
            {profile.updatingIsPublic ? (
              <Spinner animation="border" className="mx-auto" size="sm" />
            ) : null}
          </div>
        )}
        <div className="mt-2">
          <Button
            variant="primary"
            onClick={() => router.push(`/publicprofile?id=${uid}`)}
          >
            Preview Profile
          </Button>
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
