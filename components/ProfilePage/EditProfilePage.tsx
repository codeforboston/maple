import { useState, useCallback } from "react"
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
import {
  Profile,
  ProfileHook,
  useProfile,
  usePublishedTestimonyListing
} from "../db"
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
  uid: string
}) {
  const [key, setKey] = useState("AboutYou")

  const testimony = usePublishedTestimonyListing({
    uid: uid
  })

  const { items } = testimony

  const refreshtable = useCallback(() => {
    items.execute()
  }, [items])

  const tabs = [
    {
      title: "About You",
      eventKey: "AboutYou",
      content: <AboutMeEditForm profile={profile} actions={actions} uid={uid} />
    },
    {
      title: "Testimonies",
      eventKey: "Testimonies",
      content: <ViewTestimony {...testimony} showControls={true} />
    }
  ]

  return (
    <Container>
      <Header className="edit-profile-header">
        <Col className="align-items-center d-flex">Edit Profile</Col>
        <Col className={`d-flex justify-content-center w-100`}>
          <Internal href={`/profile?id=${uid}`} className="view-edit-profile">
            <Button className={`btn btn-lg`}>View your profile</Button>
          </Internal>
        </Col>
      </Header>
      <TabContainer activeKey={key} onSelect={(k: any) => setKey(k)}>
        <StyledTabNav>
          {tabs.map((t, i) => (
            <Nav.Item key={t.eventKey}>
              <Nav.Link eventKey={t.eventKey} className={`rounded-top ${i == 0 ? "ms-0 me-2" : "ms-2 me-0"}`}>{t.title}</Nav.Link>
            </Nav.Item>
          ))}
        </StyledTabNav>
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
