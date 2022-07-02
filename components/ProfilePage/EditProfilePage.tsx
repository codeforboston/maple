import { ChangeEvent, FormEvent, useState } from "react"
import { useAuth } from "../auth"
import { Col, Container, Form, Row, Spinner, Tab, Tabs } from "../bootstrap"
import { Profile, ProfileHook, useProfile } from "../db"
import { AboutMeEditForm } from "./AboutMeEditForm"

export function EditProfile() {
  const { user } = useAuth()
  const uid = user?.uid
  const result = useProfile()

  return result?.profile ? (
    <EditProfileForm profile={result.profile} actions={result} />
  ) : (
    <Row>
      <Spinner animation="border" className="mx-auto" />
    </Row>
  )
}

export function EditProfileForm({
  profile,
  actions
}: {
  profile: Profile
  actions: ProfileHook
}) {
  const [key, setKey] = useState("AboutYou")

  return (
    <Container>
      <Row>
        <Col>Edit Profile</Col>
      </Row>
      <Tabs activeKey={key}>
        <Tab
          title="About You"
          eventKey="AboutYou"
          onSelect={() => setKey("AboutYou")}
        >
          <AboutMeEditForm {...{ profile, actions }} />
        </Tab>
        <Tab
          title="Testimonies"
          eventKey="Testimonies"
          onSelect={() => setKey("Testimonies")}
        ></Tab>
      </Tabs>
    </Container>
  )
}

export const getValue = (e: ChangeEvent | FormEvent) => {
  return (e.target as HTMLInputElement).value
}

export const UploadProfileImage = () => {
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
