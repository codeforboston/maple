import { useTranslation } from "next-i18next"
import { useContext, useState } from "react"
import { useMediaQuery } from "usehooks-ts"
import { Frequency, useAuth } from "../auth"
import { Profile, useProfile } from "../db"
import { EditProfileButton, ProfileButtons } from "./ProfileButtons"
import { Header, ProfileDisplayName } from "./StyledProfileComponents"
import { ProfileIcon } from "./StyledUserIcons"
import ProfileSettingsModal from "components/EditProfilePage/ProfileSettingsModal"
import { FollowUserButton } from "components/shared/FollowButton"

export const ProfileHeader = ({
  isUser,
  profile,
  profileId
}: {
  isUser: boolean
  profile: Profile
  profileId: string
}) => {
  const actions = useProfile()
  const { t } = useTranslation("profile")
  const { role } = profile // When we have more types of profile than org and user, we will need to use the actual role from the profile, and move away from isOrg boolean.
  const { user } = useAuth()
  const isMd = useMediaQuery("(max-width: 992px)")

  const {
    public: isPublic,
    notificationFrequency: notificationFrequency
  }: Profile = profile

  const [settingsModal, setSettingsModal] = useState<"show" | null>(null)
  const [notifications, setNotifications] = useState<Frequency>(
    notificationFrequency || "Weekly"
  )
  const [isProfilePublic, setIsProfilePublic] = useState<false | true>(
    isPublic ? isPublic : false
  )

  const onSettingsModalOpen = () => {
    setSettingsModal("show")
    setNotifications(notificationFrequency || "Weekly")
    setIsProfilePublic(isPublic ? isPublic : false)
  }

  return (
    <Header>
      <div
        className={`d-flex flex-row justify-content-start align-items-center gap-3 mx-5`}
      >
        <ProfileIcon role={role} large />
        <div className={`d-grid col-6 col-md-10 gap-2`}>
          <ProfileDisplayName>{profile.fullName}</ProfileDisplayName>
          {user && isUser ? ( // Am I Logged In? and Is This My Profile?
            <EditProfileButton
              className={`py-1 col-md-8`}
              tab="button.editProfile"
            />
          ) : user ? ( // Am I Logged In? and Is This Not My Profile?
            <FollowUserButton profileId={profileId} />
          ) : (
            // I Am Not Logged In and This Is Not My Profile
            <></>
          )}
        </div>
      </div>
      <div
        className={`col-12 d-flex justify-content-center justify-content-md-end align-items-center ms-md-auto ${
          isMd ? `col-md-3` : `col-md-2`
        }`}
      >
        <ProfileButtons
          hideTestimonyButton={false}
          isUser={isUser}
          onSettingsModalOpen={onSettingsModalOpen}
        />
      </div>
      <ProfileSettingsModal
        actions={actions}
        role={profile.role}
        isProfilePublic={isProfilePublic}
        setIsProfilePublic={setIsProfilePublic}
        notifications={notifications}
        setNotifications={setNotifications}
        onHide={close}
        onSettingsModalClose={() => {
          setSettingsModal(null)
          window.location.reload()
          /* when saved and reopened, modal wasn't updating *
           * would like to find cleaner solution            */
        }}
        show={settingsModal === "show"}
      />
    </Header>
  )
}
