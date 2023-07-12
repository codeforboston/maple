import { useTranslation } from "next-i18next"
import { Button } from "react-bootstrap"
import { ProfileHook, useProfile } from "../db"
import { Internal } from "components/links"
import styled from "styled-components"

const StyledButton1 = styled(Button)`
  height: 34px;
  width: 116px;
`

const StyledButton2 = styled(Button)`
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

const StyledButton3 = styled(Button)`
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
  isMobile,
  isOrg,
  isProfilePublic,
  onProfilePublicityChanged
}: {
  isMobile: boolean
  isOrg: boolean
  isProfilePublic: boolean | undefined
  onProfilePublicityChanged: (isPublic: boolean) => void
}) => {
  const { t } = useTranslation("editProfile")

  const isWideOrg = isOrg && !isMobile

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
        <div className={isWideOrg ? `ms-1` : ``}>
          <StyledButton2
            className={`btn-sm d-flex justify-content-center ms-auto py-1 ${
              isProfilePublic ? "btn-outline-secondary" : "btn-secondary"
            } ${isWideOrg ? "" : "w-100"}`}
            onClick={handleSave}
          >
            {t("forms.makePrivate")}
          </StyledButton2>
        </div>
      ) : (
        <div className={isWideOrg ? `ms-1` : ``}>
          <StyledButton3
            className={`btn-sm d-flex justify-content-center ms-auto py-1 ${
              isProfilePublic ? "btn-outline-secondary" : "btn-secondary"
            } ${isWideOrg ? "" : "w-100"}`}
            onClick={handleSave}
          >
            {t("forms.makePublic")}
          </StyledButton3>
        </div>
      )}
    </>
  )
}
