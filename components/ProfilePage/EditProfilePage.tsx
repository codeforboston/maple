import { useState } from "react"
import { TabPane } from "react-bootstrap"
import TabContainer from "react-bootstrap/TabContainer"
import { useAuth } from "../auth"
import {
  Button,
  Col,
  Container,
  Nav,
  NavDropdown,
  Row,
  Spinner
} from "../bootstrap"
import { Profile, ProfileHook, useProfile } from "../db"
import { Internal } from "../links"
import ViewTestimony from "../UserTestimonies/ViewTestimony"
import { AboutMeEditForm } from "./AboutMeEditForm"
import {
  Header,
  StyledDropdownNav,
  StyledTabContent,
  StyledTabNav
} from "./StyledEditProfileCompnents"


export function EditProfile() {
  const { user } = useAuth()
  const uid = user?.uid
  const result = useProfile()

  return result?.profile && uid ? (
    <EditProfileForm profile={result.profile} actions={result} uid={uid} />
  ) : (
    <Row>
      <Spinner animation="border" className="mx-auto" />
    </Row>
  )
}

export function EditProfileForm({
  profile,
  actions,
  uid
}: {
  profile: Profile
  actions: ProfileHook
  uid?: string
}) {
  const [key, setKey] = useState("AboutYou")

  const tabs = [
    {
      title: "About You",
      eventKey: "AboutYou",
      content: <AboutMeEditForm profile={profile} actions={actions} uid={uid} />
    },
    {
      title: "Testimonies",
      eventKey: "Testimonies",
      content: <ViewTestimony uid={uid} />
    }
  ]

  return (
    <Container>
      <Header>
        <Col>Edit Profile</Col>
        <Col className={`d-flex justify-content-end`}>
          <Internal href={`/profile?id=${uid}`}>
            <Button className={`btn btn-lg`}>View your profile</Button>
          </Internal>
        </Col>
      </Header>
      <TabContainer activeKey={key} onSelect={(k: any) => setKey(k)}>
        <StyledTabNav className={`d-none d-md-flex`}>
          {tabs.map(t => (
            <Nav.Item key={t.eventKey}>
              <Nav.Link eventKey={t.eventKey}>{t.title}</Nav.Link>
            </Nav.Item>
          ))}
        </StyledTabNav>
        <StyledDropdownNav
          title={tabs.find(t => t.eventKey === key)?.title || key}
          className={`d-flex d-md-none`}
        >
          {tabs.map(t => (
            <NavDropdown.Item key={t.eventKey} eventKey={t.eventKey}>
              {t.title}
            </NavDropdown.Item>
          ))}
        </StyledDropdownNav>
        <StyledTabContent>
          {tabs.map(t => (
            <TabPane key={t.eventKey} title={t.title} eventKey={t.eventKey}>
              {t.content}
            </TabPane>
          ))}
        </StyledTabContent>
      </TabContainer>
    </Container>
  )
}
