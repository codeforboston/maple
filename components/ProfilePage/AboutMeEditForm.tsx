import { ChangeEvent, FormEvent, useEffect, useState } from "react"
import { Button, Col, Form, Image, Row } from "../bootstrap"
import { Profile, ProfileHook } from "../db"
import SelectLegislators from "../SelectLegislators"
import { TitledSectionCard } from "../shared"
import { getValue, UploadProfileImage } from "./EditProfilePage"

export function AboutMeEditForm({
  profile,
  actions
}: {
  profile: Profile
  actions: ProfileHook
}) {
  const {
    displayName,
    about,
    organization,
    representative,
    public: isPublic,
    senator,
    social
  }: Profile = profile

  const {
    updateIsPublic,
    updateIsOrganization,
    updateSocial,
    updateAbout,
    updateDisplayName
  } = actions

  const [newName, setNewName] = useState(displayName)
  const [newAbout, setNewAbout] = useState(about)
  const [newTwitter, setNewTwitter] = useState(social?.twitter)
  const [newLinkedIn, setNewLinkedIn] = useState(social?.linkedIn)

  const handleOrganizationUpdate = (e: ChangeEvent) => {
    // updateIsOrganization(getValue(e) === "Organization")
  }

  const handleNameUpdate = (e: ChangeEvent) => {
    setNewName(getValue(e))
  }
  const handleAboutUpdate = (e: ChangeEvent) => {
    setNewAbout(getValue(e))
  }
  const handleIsPublicUpdate = (e: ChangeEvent) => {}

  const handleTwitterUpdate = (e: ChangeEvent) => {
    setNewTwitter(getValue(e))
  }

  const handleLinkedInUpdate = (e: FormEvent) => {
    setNewLinkedIn(getValue(e))
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
  
    console.log(newName, newAbout, newTwitter, newLinkedIn)
    newName && updateDisplayName(newName)
    newAbout && updateAbout(newAbout)
    newTwitter && updateSocial("twitter", newTwitter)
    newLinkedIn && updateSocial("linkedIn", newLinkedIn)
  }

  return (
    <TitledSectionCard
      title={"About You"}
      bug={<Col>allow others to see your profile</Col>}
    >
      <Form onSubmit={onSubmit}>
        <Form.FloatingLabel label="User Type" className="mb-3">
          <Form.Select
            value={organization ? "Organization" : "Individual"}
            onChange={handleOrganizationUpdate}
          >
            <option>Organization</option>
            <option>Individual</option>
          </Form.Select>
        </Form.FloatingLabel>
        <Form.FloatingLabel label="Name" className="mb-3">
          <Form.Control
            type="text"
            value={newName}
            onChange={handleNameUpdate}
          />
        </Form.FloatingLabel>
        <Form.FloatingLabel
          label="Write something about your organization"
          className="mb-3"
        >
          <Form.Control
            value={newAbout}
            as="textarea"
            style={{ height: "100px" }}
            onChange={handleAboutUpdate}
          />
        </Form.FloatingLabel>
        <Row>
          <Image
            className="col-2"
            style={{ objectFit: "contain" }}
            alt="Profile image"
            src={"leaf-asset.png"}
            fluid
          ></Image>
          <UploadProfileImage />
          <Form.Group as={Col} name="SocialMedia">
            <Form.FloatingLabel label="Twitter Username" className="mb-3">
              <Form.Control
                name="twitter"
                type="text"
                value={social?.twitter}
                onChange={handleTwitterUpdate}
              />
            </Form.FloatingLabel>
            <Form.FloatingLabel label="LinkedIn Username" className="mb-3">
              <Form.Control
                name="linkedIn"
                type="text"
                value={social?.linkedIn}
                onChange={handleLinkedInUpdate}
              />
            </Form.FloatingLabel>
          </Form.Group>
        </Row>
          <Form.Group className="d-flex col-auto m-auto">
            <Button className="flex-grow-0 m-auto" type="submit">
            Save Profile
            </Button>
          </Form.Group>
      </Form>
      <SelectLegislators />
      <Row className={`row-cols-1`}></Row>
    </TitledSectionCard>
  )
}
