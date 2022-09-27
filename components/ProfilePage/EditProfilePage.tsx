import { useCallback, useEffect, useState } from "react"
import { TabPane } from "react-bootstrap"
import TabContainer from "react-bootstrap/TabContainer"
import { useAuth } from "../auth"
import { Button, Col, Container, Nav, Row, Spinner } from "../bootstrap"
import {
  Profile,
  ProfileHook,
  useProfile,
  usePublishedTestimonyListing,
  useTestimonyListing,
} from "../db"
import { Internal } from "../links"
import ViewTestimony from "../UserTestimonies/ViewTestimony"
import { AboutMeEditForm } from "./AboutMeEditForm"
import {
  Header,
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
  const [formUpdated, setFormUpdated] = useState(false)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState<boolean>(true)
  const { testimony } = useTestimonyListing(uid)

  useEffect(() => {
    if (testimony && testimony.length > 0) {
      setLoading(true)

      console.log('data', data)
      const data = testimony.map(e => 
        e?.publication ?
        ({ ...e.publication.value, id: e.publication.id }) :
        ({ ...e.draft.value, id: e.draft.id, authorUid: uid, authorDisplayName: profile.displayName }))

      setItems(data)
      setLoading(false)
    }
  }, [testimony])

  const tabs = [
    {
      title: "About You",
      eventKey: "AboutYou",
      content: (
        <AboutMeEditForm
          profile={profile}
          actions={actions}
          uid={uid}
          setFormUpdated={setFormUpdated}
          className="mt-3 mb-4"
        />
      )
    },
    {
      title: "Testimonies",
      eventKey: "Testimonies",
      content: loading ? (
        <Row>
          <Spinner animation="border" className="mx-auto" />
        </Row>
      ) : (
        <ViewTestimony
          items={{ result: items }}
          showControls={true}
          showBillNumber
          className="mt-3 mb-4"
        />
      )
    }
  ]

  return (
    <Container>
      <Header>
        <Col>Edit Profile</Col>
        <Col className={`d-flex justify-content-end`}>
          <Internal href={`/profile?id=${uid}`}>
            <Button className={`btn btn-lg`} disabled={!!formUpdated}>
              {!profile.organization
                ? "View your profile"
                : "View your organization page"}
            </Button>
          </Internal>
        </Col>
      </Header>
      <TabContainer activeKey={key} onSelect={(k: any) => setKey(k)}>
        <StyledTabNav>
          {tabs.map((t, i) => (
            <Nav.Item key={t.eventKey}>
              <Nav.Link
                eventKey={t.eventKey}
                className={`rounded-top ${i == 0 ? "ms-0 me-2" : "ms-2 me-0"}`}
              >
                {t.title}
              </Nav.Link>
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
