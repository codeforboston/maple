import { useTranslation } from "next-i18next"
import { Button, ButtonProps } from "react-bootstrap"
import { ProfileHook, useProfile } from "../db"
import { Internal } from "components/links"
import styled from "styled-components"
import { title } from "process"

export const StyledButton1 = styled(Button)`
  height: 34px;
  width: 116px;
`

export const BaseButton = styled(Button).attrs(props => ({
  className: `btn-sm d-flex justify-content-center ms-auto py-1 ${props.className}`
}))``

export const StyledButton2 = styled(BaseButton)`
  &:focus {
    color: #1a3185;
    background-color: white;
    border-color: #1a3185;
  }
  &:hover {
    color: white;
    background-color: #1a3185;
    border-color: white;
  }
  height: 34px;
  width: 116px;

  @media (max-width: 768px) {
    position: relative;
    top: -9px;
  }
`

export const StyledButton3 = styled(BaseButton)`
  &:focus {
    color: white;
    background-color: #1a3185;
    border-color: white;
  }
  &:hover {
    color: #1a3185;
    background-color: white;
    border-color: #1a3185;
  }
  height: 34px;
  width: 116px;

  @media (max-width: 768px) {
    position: relative;
    top: -9px;
  }
`

export const EditProfileButton = () => {
  const { t } = useTranslation("profile")

  return (
    <Internal href="/editprofile" className="view-edit-profile">
      <StyledButton1 className={`btn mb-1 py-1`}>
        {t("button.editProfile")}
      </StyledButton1>
    </Internal>
  )
}

export const MakePublicButton = ({
  isProfilePublic,
  onProfilePublicityChanged
}: {
  isProfilePublic: boolean | undefined
  onProfilePublicityChanged: (isPublic: boolean) => void
}) => {
  const { t } = useTranslation("editProfile")

  const actions = useProfile()

  const handleSave = async () => {
    await updateProfile({ actions })
  }

  async function updateProfile({ actions }: { actions: ProfileHook }) {
    const { updateIsPublic } = actions

    await updateIsPublic(!isProfilePublic)
    onProfilePublicityChanged(!isProfilePublic)
  }

  return (
    <>
      {isProfilePublic ? (
        <StyledButton2 onClick={handleSave} variant={"outline-secondary"}>
          {t("forms.makePrivate")}
        </StyledButton2>
      ) : (
        <StyledButton3 onClick={handleSave} variant={"secondary"}>
          {t("forms.makePublic")}
        </StyledButton3>
      )}
    </>
  )
}
