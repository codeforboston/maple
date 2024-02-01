import { Col, Row } from "../bootstrap"
import { Header, ProfileDisplayName } from "./StyledProfileComponents"
import { ProfileIcon } from "./StyledUserIcons"

import { ProfileHook, useProfile } from "components/db"
import { useTranslation } from "next-i18next"
import { Profile } from "../db"
import { FollowButton } from "./FollowButton" // TODO: move to /shared
import { OrgContactInfo } from "./OrgContactInfo"
import { EditProfileButton, ToggleProfilePrivate } from "./ProfileButtons"

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
          {role === "organization" ? (
            <ProfileButtonsOrg isUser={isUser} />
          ) : null}
        </div>
      </div>
      <div className="col-12 col-md-auto d-flex justify-content-center justify-content-md-end align-items-center ms-md-auto ">
        {isOrg ? <OrgContactInfo profile={profile} /> : null}
        {isUser ? (
          <ProfileButtonsUser
            isProfilePublic={isProfilePublic}
            onProfilePublicityChanged={onProfilePublicityChanged}
          />
        ) : null}
      </div>
    </Header>
  )
}

function ProfileButtonsUser({
  isProfilePublic,
  onProfilePublicityChanged
}: {
  isProfilePublic: boolean | undefined
  onProfilePublicityChanged: (isPublic: boolean) => void
}) {
  const { t } = useTranslation("editProfile")

  const actions = useProfile()

  const handleSave = async () => {
    await updateProfile({ actions })
  }
  /** Only regular users are allowed to have a public profile. */
  async function updateProfile({ actions }: { actions: ProfileHook }) {
    const { updateIsPublic } = actions

    await updateIsPublic(!isProfilePublic)
    onProfilePublicityChanged(!isProfilePublic)
  }
  return (
    <div className={`d-grid gap-1 col-12 m-3`}>
      <EditProfileButton />
      <ToggleProfilePrivate
        onClick={handleSave}
        isProfilePublic={isProfilePublic}
      >
        {isProfilePublic ? t("forms.makePrivate") : t("forms.makePublic")}
      </ToggleProfilePrivate>
    </div>
  )
}

function ProfileButtonsOrg({ isUser }: { isUser: boolean }) {
  return <>{isUser ? <EditProfileButton /> : <FollowButton />}</>
}
