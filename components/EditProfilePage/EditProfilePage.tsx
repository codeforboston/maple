import { useTranslation } from "next-i18next"
import Router from "next/router"
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
import { useFlags } from "components/featureFlags"
import LoginPage from "components/Login/login"
import { PendingUpgradeBanner } from "components/PendingUpgradeBanner"
import { FollowersTab } from "./FollowersTab"

const tabTitle = ["about-you", "testimonies", "following", "followers"] as const
export type TabTitles = (typeof tabTitle)[number]

export default function EditProfile({
  tabTitle = "about-you"
}: {
  tabTitle?: TabTitles
}) {
  const { user } = useAuth()
  const uid = user?.uid
  const result = useProfile()

  if (result.loading && uid) {
    return (
      <Row>
        <Spinner animation="border" className="mx-auto" />
      </Row>
    )
  }

  if (result.loading) {
    return <LoginPage />
  }

  if (result?.profile && uid) {
    return (
      <EditProfileForm
        actions={result}
        profile={result.profile}
        tabTitle={tabTitle}
        uid={uid}
      />
    )
  }
}

export function EditProfileForm({
  actions,
  profile,
  tabTitle,
  uid
}: {
  actions: ProfileHook
  profile: Profile
  tabTitle: TabTitles
  uid: string
}) {
  const handleOnClick = (t: TabTitles) => {
    Router.push(`/edit-profile/${t}`)
  }

  const {
    public: isPublic,
    notificationFrequency: notificationFrequency
  }: Profile = profile

  const [formUpdated, setFormUpdated] = useState(false)
  const [settingsModal, setSettingsModal] = useState<"show" | null>(null)
  const [notifications, setNotifications] = useState<
    "Weekly" | "Monthly" | "None"
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
  const [followerCount, setFollowerCount] = useState<number | null>(null)

  const tabs = [
    {
      title: t("tabs.personalInfo"),
      eventKey: "about-you",
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
      eventKey: "testimonies",
      content: (
        <TestimoniesTab
          publishedTestimonies={publishedTestimonies.items.result ?? []}
          draftTestimonies={draftTestimonies.result ?? []}
        />
      )
    },
    {
      title: t("tabs.following"),
      eventKey: "following",
      content: <FollowingTab className="mt-3 mb-4" />
    },
    {
      title: followerCount
        ? t("tabs.followersWithCount", { count: followerCount })
        : t("tabs.followers"),
      eventKey: "followers",
      content: (
        <FollowersTab
          className="mt-3 mb-4"
          setFollowerCount={setFollowerCount}
        />
      )
    }
  ]

  const { followOrg } = useFlags()

  if (followOrg === false) {
    tabs.splice(2, 1)
  }

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
          defaultActiveKey="about-you"
          activeKey={tabTitle}
          onSelect={(tabTitle: any) => handleOnClick(tabTitle)}
        >
          <TabNavWrapper>
            {tabs.map((t, i) => (
              <TabNavItem key={i} tab={t} i={i} />
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
