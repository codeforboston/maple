import { useTranslation } from "next-i18next"
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
// import { FollowingTab } from "./FollowingTab"
import { PersonalInfoTab } from "./PersonalInfoTab"
import ProfileSettingsModal from "./ProfileSettingsModal"
import {
  Header,
  StyledTabContent,
  StyledTabNav
} from "./StyledEditProfileComponents"
import { TestimoniesTab } from "./TestimoniesTab"
import { Banner } from "components/shared/StyledSharedComponents"
import { PendingUpgradeBanner } from "components/PendingUpgradeBanner"

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

  const isPendingUpgrade = useAuth().claims?.role === "pendingUpgrade"

  const { t } = useTranslation("editProfile")

  const tabs = [
    {
      title: t("tabs.personalInfo"),
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
      title: t("tabs.testimonies"),
      eventKey: "Testimonies",
      content: (
        <TestimoniesTab
          publishedTestimonies={publishedTestimonies.items.result}
          draftTestimonies={draftTestimonies.result}
          className="mt-3 mb-4"
        />
      )
    } /* ,
    {
      title: "Following",
      eventKey: "Following",
      content: <FollowingTab className="mt-3 mb-4" />
    } */
  ]

  return (
    <>
      {isPendingUpgrade && <PendingUpgradeBanner />}

      <Container>
        <Header>
          <Col>{t("header")}</Col>
          <Col className={`d-flex justify-content-end`}>
            <GearButton
              variant="outline-secondary"
              size="lg"
              className={`me-4 py-1`}
              disabled={!!formUpdated}
              onClick={() => onSettingsModalOpen()}
            >
              {t("Settings")}
            </GearButton>
            <Button
              className={`btn-lg py-1 ml-2 text-decoration-none`}
              disabled={!!formUpdated}
              href={`/profile?id=${uid}`}
            >
              {profile.role !== "organization"
                ? t("viewMyProfile")
                : t("viewOrgProfile")}
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
