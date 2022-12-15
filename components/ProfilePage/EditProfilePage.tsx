import { useCallback, useState } from "react"
import { TabPane } from "react-bootstrap"
import TabContainer from "react-bootstrap/TabContainer"
import { useAuth } from "../auth"
import { Button, Col, Container, Nav, Row, Spinner } from "../bootstrap"
import { GearButton } from "../buttons"
import {
  Profile,
  ProfileHook,
  useProfile,
  usePublishedTestimonyListing
} from "../db"
import { Internal } from "../links"
import ViewTestimony from "../UserTestimonies/ViewTestimony"
import { AboutMeEditForm } from "./AboutMeEditForm"
import NotificationSettingsModal from "./NotificationSettingsModal"
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
  const [settingsModal, setSettingsModal] = useState<"show" | null>(null)

  const {
    displayName,
    about,
    organization,
    private: isPrivate,
    public: isPublic,
    social,
    profileImage
  }: Profile = profile

  const [profileSettings, setProfileSettings] = useState<"yes" | "">(
    isPrivate === "yes" ? "yes" : ""
  )

  const onSettingsModalOpen = () => {
    setSettingsModal("show")
    setProfileSettings(isPrivate === "yes" ? "yes" : "")
  }

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
      content: (
        <ViewTestimony
          {...testimony}
          showControls={true}
          showBillNumber
          className="mt-3 mb-4"
        />
      )
    }
  ]

  const close = () => setSettingsModal(null)

  return (
    <Container>
      <Header>
        <Col>Edit Profile</Col>
        <Col className={`d-flex justify-content-end`}>
          <Internal className={`ml-2`} href={`javascript:void(0)`}>
            <GearButton
              className={`btn btn-lg btn-outline-secondary me-4`}
              disabled={!!formUpdated}
              onClick={() => onSettingsModalOpen()}
            >
              {"Settings"}
            </GearButton>
          </Internal>
          <Internal className={`ml-2`} href={`/profile?id=${uid}`}>
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
      <NotificationSettingsModal
        actions={actions}
        onHide={close}
        onSettingsModalClose={() => setSettingsModal(null)}
        profile={profile}
        profileSettings={profileSettings}
        setProfileSettings={setProfileSettings}
        show={settingsModal === "show"}
        uid={uid}
      />
    </Container>
  )
}
