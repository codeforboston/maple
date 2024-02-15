import { useTranslation } from "next-i18next"
import { useState } from "react"
import { TabPane } from "react-bootstrap"
import TabContainer from "react-bootstrap/TabContainer"
import { Role, useAuth } from "../auth"
import { Button, Col, Container, Nav, Row, Spinner, Stack } from "../bootstrap"
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
  EditProfileTabContent,
  Header,
  StyledTabContent,
  StyledTabNav
} from "./StyledEditProfileComponents"
import { TestimoniesTab } from "./TestimoniesTab"
import { Banner } from "components/shared/StyledSharedComponents"
import { PendingUpgradeBanner } from "components/PendingUpgradeBanner"
import { ToggleProfilePrivate } from "components/ProfilePage/ProfileButtons"

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
        <EditProfileHeader
          formUpdated={formUpdated}
          onSettingsModalOpen={onSettingsModalOpen}
          uid={uid}
          role={profile.role}
        />
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
          <EditProfileTabContent>
            {tabs.map(t => (
              <TabPane key={t.eventKey} title={t.title} eventKey={t.eventKey}>
                {t.content}
              </TabPane>
            ))}
          </EditProfileTabContent>
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

export const EditProfileHeader = ({
  formUpdated,
  onSettingsModalOpen,
  uid,
  role
}: {
  formUpdated: boolean
  onSettingsModalOpen: () => void
  uid: string
  role: Role
}) => {

  const { t } = useTranslation("editProfile")

  return (
    <Row className={`my-5`}>
      <Col className={`align-self-end`}>
        <h1 className={`display-3`}>{t("header")}</h1>
      </Col>
      <Col xs={12} md={2}>
        <Stack gap={2} className={`d-flex justify-content-end`}>
          <GearButton
            variant="outline-secondary"
            disabled={!!formUpdated}
            onClick={() => onSettingsModalOpen()}
          >
            {t("settings")}
          </GearButton>
          <Button
            className={`btn py-1 fs-5 ml-2 text-decoration-none text-nowrap`}
            disabled={!!formUpdated}
            href={`/profile?id=${uid}`}
          >
            {role !== "organization"
              ? t("viewMyProfile")
              : t("viewOrgProfile")}
          </Button>
        </Stack>
      </Col>
    </Row>
  )
}
