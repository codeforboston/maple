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
import { FollowingTab } from "./FollowingTab"
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
  const {
    public: isPublic,
    notificationFrequency: notificationFrequency
  }: Profile = profile

  const [key, setKey] = useState("AboutYou")
  const [formUpdated, setFormUpdated] = useState(false)
  const [settingsModal, setSettingsModal] = useState<"show" | null>(null)
  const [notifications, setNotifications] = useState<
    "Daily" | "Weekly" | "Monthly" | "None"
  >(notificationFrequency ? notificationFrequency : "Monthly")
  const [isProfilePublic, setIsProfilePublic] = useState<false | true>(
    isPublic ? isPublic : false
  )

  const onSettingsModalOpen = () => {
    setSettingsModal("show")
    setNotifications(notificationFrequency ? notificationFrequency : "Monthly")
    setIsProfilePublic(isPublic ? isPublic : false)
  }

  const close = () => setSettingsModal(null)

  const testimony = usePublishedTestimonyListing({
    uid: uid
  })

  const { items } = testimony

  const refreshtable = useCallback(() => {
    items.execute()
  }, [items])

  const tabs = [
    {
      /* 
        Change in Figma
       */
      // title: "About You",
      title: "Personal Information",
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
    },
    {
      title: "Following",
      eventKey: "Following",
      content: <FollowingTab className="mt-3 mb-4" />
    }
  ]

  return (
    <Container>
      <Header>
        <Col>Edit Profile</Col>
        <Col className={`d-flex justify-content-end`}>
          <Internal
            className={`d-flex text-decoration-none`}
            href={`javascript:void(0)`}
          >
            <GearButton
              className={`btn btn-lg btn-outline-secondary me-4 py-1`}
              disabled={!!formUpdated}
              onClick={() => onSettingsModalOpen()}
            >
              {"Settings"}
            </GearButton>
          </Internal>
          <Internal
            className={`d-flex ml-2 text-decoration-none`}
            href={!!formUpdated ? `javascript:void(0)` : `/profile?id=${uid}`}
          >
            <Button className={`btn btn-lg py-1`} disabled={!!formUpdated}>
              {!profile.organization
                ? "View My Profile"
                : "View My Organization"}
            </Button>
          </Internal>
        </Col>
      </Header>
      <TabContainer activeKey={key} onSelect={(k: any) => setKey(k)}>
        <StyledTabNav>
          {tabs.map((t, i) => (
            <Nav.Item key={t.eventKey}>
              <Nav.Link eventKey={t.eventKey} className={`rounded-top m-0 p-0`}>
                <p className={`my-0 ${i == 0 ? "" : "mx-4"}`}>{t.title}</p>
                <hr className={`my-0`} />
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
        isProfilePublic={isProfilePublic}
        setIsProfilePublic={setIsProfilePublic}
        notifications={notifications}
        setNotifications={setNotifications}
        onHide={close}
        onSettingsModalClose={() => setSettingsModal(null)}
        show={settingsModal === "show"}
      />
    </Container>
  )
}
