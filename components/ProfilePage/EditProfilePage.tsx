import { ChangeEvent, FormEvent, useState } from "react"
import { TabContent, TabPane } from "react-bootstrap"
import TabContainer from "react-bootstrap/TabContainer"
import styled from "styled-components"
import { useAuth } from "../auth"
import {
  Button,
  Col,
  Container,
  Form,
  Nav,
  NavDropdown,
  Row,
  Spinner
} from "../bootstrap"
import { Profile, ProfileHook, useProfile } from "../db"
import { Internal } from "../links"
import ViewTestimony from "../UserTestimonies/ViewTestimony"
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

const StyledTabNav = styled(Nav).attrs(props => ({
  className: props.className
}))`
  text-align: center;
  margin: 0 1rem;
  font-family: Nunito;
  font-size: 1.25rem;
  color: var(--bs-dark);
  height: 2.25em;

  .nav-link.active {
    height: 4.4rem;
  }

  .nav-link {
    background-color: white;
    overflow: visible;
    width: auto;
    margin: 0 1rem;
  }

  .nav-link:first-child {
    margin-left: 0;
  }
`

const StyledDropdownNav = styled(NavDropdown).attrs(props => ({
  className: props.className
}))`
  font-family: Nunito;
  font-size: 1.25rem;
  width: auto;
  margin: auto;

  .nav-link,
  a {
    height: 2.25em;
    width: fit-content;
    margin-left: 1rem;
    z-index: 1;
    color: var(--bs-dark);
    background-color: white;
    text-align: left;
  }

  .nav-item .active,
  a.active {
    background-color: white;
  }
`

const StyledTabContent = styled(TabContent)`
  margin-top: -0.5rem;
  z-index: -1;
`

const Header = styled(Row)`
  font-size: 3.75rem;
  font-family: Nunito;
  font-weight: 500;
  margin-right: 1rem;
`
export function EditProfileForm({
  profile,
  actions
}: {
  profile: Profile
  actions: ProfileHook
}) {
  const [key, setKey] = useState("AboutYou")

  const tabs = [
    {
      title: "About You",
      eventKey: "AboutYou",
      content: <AboutMeEditForm {...{ profile, actions }} />
    },
    {
      title: "Testimonies",
      eventKey: "Testimonies",
      content: <ViewTestimony />
    }
  ]

  return (
    <Container>
      <Header>
        <Col>Edit Profile</Col>
        <Col className={`col-12 col-md-5`}>
          <div
            className={`d-flex justify-content-center justify-content-md-end align-items-center align-items-md-end`}
          >
            <Internal href="/profile">
              <Button className={`btn btn-lg`}>View your profile</Button>
            </Internal>
          </div>
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

export const getValue = (e: ChangeEvent | FormEvent) => {
  return (e.target as HTMLInputElement).value
}

export const UploadProfileImage = ({ className }: { className: string }) => {
  return (
    <Form.Group as={Col}>
      <Form.Label>Choose your profile image</Form.Label>
      <Form.Control
        type="file"
        accept="image/png, image/jpg"
        placeholder="Chooose your profile image"
        className={className}
      />
    </Form.Group>
  )
}
