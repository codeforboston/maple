import { PendingUpgradeBanner } from "components/PendingUpgradeBanner"
import { useTranslation } from "next-i18next"
import { useState } from "react"
import { TabPane } from "react-bootstrap"
import TabContainer from "react-bootstrap/TabContainer"
import { useAuth } from "../auth"
import { Container, Row, Spinner } from "../bootstrap"
import {
  Profile,
  ProfileHook,
  UseDraftTestimonyListing,
  UsePublishedTestimonyListing,
  useDraftTestimonyListing,
  useProfile,
  usePublishedTestimonyListing
} from "../db"
import { EditProfileHeader } from "./EditProfileHeader"
import { FollowingTab } from "./FollowingTab"
import { PersonalInfoTab } from "./PersonalInfoTab"
import ProfileSettingsModal from "./ProfileSettingsModal"
import {
  StyledTabContent,
  TabNavItem,
  TabNavWrapper
} from "./StyledEditProfileComponents"
import { TestimoniesTab } from "./TestimoniesTab"

export function EditProfile() {
  const { user } = useAuth()
  const uid = user?.uid
  const result = useProfile()

  if (result.loading) {
    return (
      <Row>
        <Spinner animation="border" className="mx-auto" />
      </Row>
    )
  }

  if (result?.profile && uid) {
    return (
      <EditProfileForm profile={result.profile} actions={result} uid={uid} />
    )
  }

  // Todo add error handling/404 page?
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

  const publishedTestimonies: UsePublishedTestimonyListing =
    usePublishedTestimonyListing({ uid: uid })

  const draftTestimonies: UseDraftTestimonyListing = useDraftTestimonyListing({
    uid: uid
  })

  let isOrg = profile.role === "organization"

  const isPendingUpgrade = useAuth().claims?.role === "pendingUpgrade"

  isOrg = isOrg || isPendingUpgrade

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
          publishedTestimonies={publishedTestimonies.items.result ?? []}
          draftTestimonies={draftTestimonies.result ?? []}
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
    <>
      {isPendingUpgrade && <PendingUpgradeBanner />}

      <Container>
        <EditProfileHeader
          formUpdated={formUpdated}
          onSettingsModalOpen={onSettingsModalOpen}
          uid={uid}
          role={profile.role}
        />
        <TabContainer
          defaultActiveKey="AboutYou"
          activeKey={key}
          onSelect={(k: any) => setKey(k)}
        >
          <TabNavWrapper>
            {tabs.map((t, i) => (
              <>
                <TabNavItem tab={t} i={i} />
              </>
            ))}
          </TabNavWrapper>
          <StyledTabContent>
            {tabs.map(t => (
              <TabPane key={t.eventKey} title={t.title} eventKey={t.eventKey}>
                {t.content}
              </TabPane>
            ))}
          </StyledTabContent>
        </TabContainer>
      </Container>
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
    </>
  )
}
