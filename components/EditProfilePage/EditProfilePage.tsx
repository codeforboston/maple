import { useState } from "react"
import { TabPane } from "react-bootstrap"
import TabContainer from "react-bootstrap/TabContainer"
import { useAuth } from "../auth"
import { Button, Col, Container, Nav, Row, Spinner } from "../bootstrap"
import { GearButton } from "../buttons"
import {
  Profile,
  ProfileHook,
  useDraftTestimonyListing,
  useProfile,
  usePublishedTestimonyListing
} from "../db"
import { Internal } from "../links"
import { PersonalInfoTab } from "./PersonalInfoTab"
import { FollowingTab } from "./FollowingTab"
import ProfileSettingsModal from "./ProfileSettingsModal"
import {
  Header,
  StyledTabContent,
  StyledTabNav
} from "./StyledEditProfileComponents"
import { TestimoniesTab } from "./TestimoniesTab"
import { Banner } from "components/shared/StyledSharedComponents"

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

  const publishedTestimonies = usePublishedTestimonyListing({
    uid: uid
  })

  const draftTestimonies = useDraftTestimonyListing({ uid: uid })

  const isOrg =
    profile.role === "organization" || profile.role === "pendingUpgrade"

  const isPendingUpgrade = profile.role === "pendingUpgrade"

  const tabs = [
    {
      title: "Personal Information",
      eventKey: "AboutYou",
      content: (
        <PersonalInfoTab
          profile={profile}
          actions={actions}
          uid={uid}
          isOrg={isOrg}
          setFormUpdated={setFormUpdated}
          className="mt-3 mb-4"
        />
      )
    },
    {
      title: "Testimonies",
      eventKey: "Testimonies",
      content: (
        <TestimoniesTab
          publishedTestimonies={publishedTestimonies.items.result}
          draftTestimonies={draftTestimonies.result}
          className="mt-3 mb-4"
        />
      )
    }
    /*
      remove comment when Notification Emails and related Follow functionality
      is ready for production
    */

    // {
    //   title: "Following",
    //   eventKey: "Following",
    //   content: <FollowingTab className="mt-3 mb-4" />
    // }
  ]

  return (
    <>
      {isPendingUpgrade && (
        <Banner>
          Your request to be an organization account is pending approval
        </Banner>
      )}

      <Container>
        <Header>
          <Col>Edit Profile</Col>
          <Col className={`d-flex justify-content-end`}>
            <GearButton
              variant="outline-secondary"
              size="lg"
              className={`me-4 py-1`}
              disabled={!!formUpdated}
              onClick={() => onSettingsModalOpen()}
            >
              {"Settings"}
            </GearButton>
            <Button
              className={`btn-lg py-1 ml-2 text-decoration-none`}
              disabled={!!formUpdated}
              href={`/profile?id=${uid}`}
            >
              {profile.role !== "organization"
                ? "View My Profile"
                : "View My Organization"}
            </Button>
          </Col>
        </Header>
        <TabContainer activeKey={key} onSelect={(k: any) => setKey(k)}>
          <StyledTabNav>
            {tabs.map((t, i) => (
              <Nav.Item key={t.eventKey}>
                <Nav.Link
                  eventKey={t.eventKey}
                  className={`rounded-top m-0 p-0`}
                >
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
        <ProfileSettingsModal
          actions={actions}
          role={profile.role}
          isProfilePublic={isProfilePublic}
          setIsProfilePublic={setIsProfilePublic}
          notifications={notifications}
          setNotifications={setNotifications}
          onHide={close}
          onSettingsModalClose={() => setSettingsModal(null)}
          show={settingsModal === "show"}
        />
      </Container>
    </>
  )
}
