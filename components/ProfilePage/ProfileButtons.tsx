import { Role } from "components/auth/types"
import { useTranslation } from "next-i18next"
import { Button } from "../bootstrap"
import styled from "styled-components"
import { FillButton, GearButton, ToggleButton } from "components/buttons"
import { Col } from "react-bootstrap"
import { Story } from "stories/atoms/BaseButton.stories"
import { Internal } from "components/links"
import { useProfile, ProfileHook } from "components/db"
import { FollowButton } from "./FollowButton"

export const StyledButton = styled(Button).attrs(props => ({
  className: `col-12 d-flex align-items-center justify-content-center py-3 text-nowrap`,
  size: "lg"
}))`
  height: 34px;
  /* width: 116px; */

  @media (max-width: 768px) {
    position: relative;
    width: 100%;
    /* top: -9px; */
  }
`

type Props = {
  formUpdated: boolean
  uid: string
  role: Role
}

export const ProfileEditToggle = ({ formUpdated, uid, role }: Props) => {
  const { t } = useTranslation(["editProfile"])
  return (
    <FillButton
      className={`py-1 ml-2 text-decoration-none`}
      disabled={!!formUpdated}
      href={`/ profile ? id = ${uid} `}
      label={role !== "organization" ? t("viewMyProfile") : t("viewOrgProfile")}
    />
  )
}

export const EditProfileButton = ({ className }: { className?: string }) => {
  const { t } = useTranslation("profile")

  return (
    <Internal
      href="/editprofile"
      className={`text-decoration-none text-white d-flex justify-content-center align-items-center col-12 ${className}`}
    >
      <FillButton label={t("button.editProfile")} />
    </Internal>
  )
}

export function ProfileButtonsUser({
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
  /** Only regular users are allowed to have a private profile. */
  async function updateProfile({ actions }: { actions: ProfileHook }) {
    const { updateIsPublic } = actions

    await updateIsPublic(!isProfilePublic)
    onProfilePublicityChanged(!isProfilePublic)
  }
  return (
    <div className={`d-grid gap-2 col-12 m-3`}>
      <EditProfileButton className={`py-1`} />
      <ToggleButton
        toggleState={isProfilePublic || false}
        stateTrueLabel={t("forms.makePrivate")}
        stateFalseLabel={t("forms.makePublic")}
        onClick={handleSave}
        className={`py-1`}
      />
    </div>
  )
}
export function ProfileButtonsOrg({ isUser }: { isUser: boolean }) {
  return <>{isUser ? <EditProfileButton /> : <FollowButton />}</>
}
