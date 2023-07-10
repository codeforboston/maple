import { Dispatch, SetStateAction } from "react"
import { Button, Col, Stack } from "react-bootstrap"
import { Internal } from "components/links"
import { useTranslation } from "next-i18next"
import styled from "styled-components"
import { ProfileHook, useProfile } from "../db"

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

export const EditProfileButton = ({ isOrg }: { isOrg: boolean }) => {
  const { t } = useTranslation("editProfile")

  return (
    // <div
    //   className={
    //     isOrg
    //       ? `d-flex w-100 justify-content-start`
    //       : `d-flex w-100 justify-content-end`
    //   }
    // >
    //   <div className={isOrg ? `d-flex flex-row` : `d-flex flex-column`}>
    <Internal href="/editprofile" className="view-edit-profile">
      <StyledButton1 className={`btn mb-1 py-1`}>
        {t("forms.editProfile")}
      </StyledButton1>
    </Internal>
    //   </div>
    // </div>
  )
}

export const MakePublicButton = ({
  isOrg,
  isProfilePublic,
  setIsProfilePublic
}: {
  isOrg: boolean
  isProfilePublic: boolean
  setIsProfilePublic: Dispatch<SetStateAction<boolean>>
}) => {
  const { t } = useTranslation("editProfile")

  const actions = useProfile()

  const handleSave = async () => {
    await updateProfile({ actions })
  }

  async function updateProfile({ actions }: { actions: ProfileHook }) {
    const { updateIsPublic } = actions

    await updateIsPublic(!isProfilePublic)
    setIsProfilePublic(!isProfilePublic)
  }

  return (
    <>
      {isProfilePublic ? (
        <div className={isOrg ? `ms-1` : ``}>
          <StyledButton2
            className={`btn-sm d-flex justify-content-center ms-auto py-1 ${
              isProfilePublic ? "btn-outline-secondary" : "btn-secondary"
            } ${isOrg ? "" : "w-100"}`}
            onClick={handleSave}
          >
            {t("forms.makePrivate")}
          </StyledButton2>
        </div>
      ) : (
        <div className={isOrg ? `ms-1` : ``}>
          <StyledButton3
            className={`btn-sm d-flex justify-content-center ms-auto py-1 ${
              isProfilePublic ? "btn-outline-secondary" : "btn-secondary"
            } ${isOrg ? "" : "w-100"}`}
            onClick={handleSave}
          >
            {t("forms.makePublic")}
          </StyledButton3>
        </div>
      )}
    </>
  )
}
