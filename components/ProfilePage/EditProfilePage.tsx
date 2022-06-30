import { createRouterMiddleware } from "instantsearch.js/es/middlewares"
import { ChangeEvent, FormEvent, FormEventHandler, useState } from "react"
import { FormControl, FormLabel } from "react-bootstrap"
import Input from "react-select/dist/declarations/src/components/Input"
import { useAuth } from "../auth"
import {
  Col,
  Container,
  Form,
  Row,
  Spinner,
  Tab,
  Tabs,
  Image
} from "../bootstrap"
import { Profile, ProfileHook, useProfile } from "../db"
import TitledSectionCard from "../TitledSection/TitledSectionCard"

export function EditProfile() {
  const { user } = useAuth()
  const profile = useProfile()

  return profile.loading ? (
    <Row>
      <Spinner animation="border" className="mx-auto" />
    </Row>
  ) : (
    <EditProfileForm profile={profile.profile!} actions={profile} />
  )
}

export function EditProfileForm({
  profile,
  actions
}: {
  profile: Profile
  actions: ProfileHook
}) {
  const [key, setKey] = useState()

  

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
    updateRep,
    updateSenator,
    updateIsPublic,
    updateIsOrganization,
    updateSocial,
    updateAbout,
    updateDisplayName
  } = actions

  const handleOrganizationUpdate = (e: ChangeEvent) => {
    updateIsOrganization(getValue(e) === "Organization")
  }

  const handleUpdateRepresentative = (e: ChangeEvent) => {
    // updateRep(getValue(e))
  }

  const handleNameUpdate = (e: ChangeEvent) => {
    updateDisplayName(getValue(e))
  }
  const handleAboutUpdate = (e: ChangeEvent) => {
    updateAbout(getValue(e))
  }

  const handleIsPublicUpdate = (e: ChangeEvent) => {
    const { value } = e.target as HTMLInputElement
  }

  const handleTwitterUpdate = (e: ChangeEvent) => {
    updateSocial("twitter", getValue(e))
  }

  const handleLinkedInUpdate = (e: FormEvent) => {
    updateSocial("linkedIn", getValue(e))
  }

  return (
    <Container>
      <Row>
        <Col>Edit Profile</Col>
      </Row>
      <Tabs activeKey={key}>
        <Tab
          title="About You"
          eventKey="AboutYou"
          onSelect={k => console.log(k.target)}
        >
          <TitledSectionCard
            title={"About You"}
            bug={<Col>allow others to see your profile</Col>}
          >
            <div>{organization ? "Organization" : "Individual"}</div>
            <div>{displayName ?? "Name"}</div>
            <div>{about?.slice(0, 100)}</div>
            <div>
              {social?.twitter} {social?.linkedIn}
            </div>
            <Form>
              <Form.FloatingLabel label="User Type" className="mb-3">
                <Form.Select
                  defaultValue={organization ? "Organization" : "Individual"}
                >
                  <option>Organization</option>
                  <option>Individual</option>
                </Form.Select>
              </Form.FloatingLabel>
              <Form.FloatingLabel label="Name" className="mb-3">
                <Form.Control
                  type="text"
                  defaultValue={displayName ?? "Name"}
                />
              </Form.FloatingLabel>
              <Form.FloatingLabel
                label="Write something about your organization"
                className="mb-3"
              >
                <Form.Control
                  defaultValue={
                    about ?? "Write something about your organization"
                  }
                  as="textarea"
                  style={{ height: "100px" }}
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
                      defaultValue={
                        social?.twitter ?? "Enter your twitter handle"
                      }
                    />
                  </Form.FloatingLabel>
                  <Form.FloatingLabel
                    label="LinkedIn Username"
                    className="mb-3"
                  >
                    <Form.Control
                      type="text"
                      defaultValue={
                        social?.linkedIn ?? "Enter your linked in name"
                      }
                    />
                  </Form.FloatingLabel>
                </Form.Group>
              </Row>
              <Form.Group as={Row} className="col-auto m-auto">
                <Form.Control
                  type="submit"
                  value="Update Profile"
                  className="w-auto m-auto"
                  onClick={console.log}
                ></Form.Control>
              </Form.Group>
            </Form>
            <Row className={`row-cols-1`}></Row>
          </TitledSectionCard>
        </Tab>
        <Tab
          title="Testimonies"
          eventKey="Testimonies"
          onSelect={k => console.log(k)}
        ></Tab>
      </Tabs>
    </Container>
  )
}

const getValue = (e: ChangeEvent | FormEvent) => {
  return (e.target as HTMLInputElement).value
}

const UploadProfileImage = () => {
  return (
    <Form.Group as={Col}>
      <Form.Label>Chose your profile image</Form.Label>
      <Form.Control
        type="file"
        accept="image/png, image/jpg"
        placeholder="Choose your profile image"
      ></Form.Control>
    </Form.Group>
  )
}
