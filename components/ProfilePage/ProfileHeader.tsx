import { Header, ProfileDisplayName } from "./StyledProfileComponents"
import { ProfileIcon } from "./StyledUserIcons"

import { useTranslation } from "next-i18next"
import { Profile } from "../db"
import { OrgContactInfo } from "./OrgContactInfo"
import { ProfileButtonsOrg, ProfileButtonsUser } from "./ProfileButtons"

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
          {isOrg ? <ProfileButtonsOrg isUser={isUser} /> : null}
        </div>
      </div>
      <div className="col-12 col-md-2 d-flex justify-content-center justify-content-md-end align-items-center ms-md-auto ">
        {isOrg ? (
          <OrgContactInfo profile={profile} />
        ) : isUser ? (
          <ProfileButtonsUser
            isProfilePublic={isProfilePublic}
            onProfilePublicityChanged={onProfilePublicityChanged}
          />
        ) : null}
      </div>
    </Header>
  )
}
