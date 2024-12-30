import { useTranslation } from "next-i18next"
import { useMediaQuery } from "usehooks-ts"
import { useAuth } from "../auth"
import { Profile } from "../db"
import { EditProfileButton, ProfileButtons } from "./ProfileButtons"
import { Header, ProfileDisplayName } from "./StyledProfileComponents"
import { ProfileIcon } from "./StyledUserIcons"
import { FollowUserButton } from "components/shared/FollowButton"

export const ProfileHeader = ({
  profileId,
  profile,
  isUser,
  isOrg,
  isProfilePublic,
  onProfilePublicityChanged
}: {
  profileId: string
  profile: Profile
  isUser: boolean
  isOrg: boolean
  isProfilePublic: boolean | undefined
  onProfilePublicityChanged: (isPublic: boolean) => void
}) => {
  const { t } = useTranslation("profile")
  const { role } = profile // When we have more types of profile than org and user, we will need to use the actual role from the profile, and move away from isOrg boolean.
  const { user } = useAuth()
  const isLg = useMediaQuery("(max-width: 992px)")

  return (
    <Header>
      <div
        className={`d-flex flex-row justify-content-start align-items-center gap-3 mx-5`}
      >
        <ProfileIcon role={role} large />
        <div>
          <ProfileDisplayName className={`col-3 col-md-auto`}>
            {profile.fullName}
          </ProfileDisplayName>
          {user && !isUser ? (
            <FollowUserButton profileId={profileId} />
          ) : (
            <EditProfileButton className={`py-1`} tab="button.editProfile" />
          )}
        </div>
      </div>
      <div
        className={`col-12 d-flex justify-content-center justify-content-md-end align-items-center ms-md-auto ${
          isLg ? `col-md-3` : `col-md-2`
        }`}
      >
        <ProfileButtons
          isProfilePublic={isProfilePublic}
          onProfilePublicityChanged={onProfilePublicityChanged}
          isUser={isUser}
          profileId={profileId}
        />
      </div>
    </Header>
  )
}
