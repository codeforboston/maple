import { Col, Button } from "react-bootstrap"
import { Internal } from "components/links"
import { useTranslation } from "next-i18next"
import styled from "styled-components"
import { Profile } from "../db"

const StyledButton1 = styled(Button)`
  height: 34px;
  width: 110px;
`

const StyledButton2 = styled(Button)`
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
  width: 110px;

  @media (max-width: 768px) {
    position: relative;
    top: -9px;
  }
`

export const EditProfileButton = ({
  isMobile,
  isOrg,
  profile
}: {
  isMobile: boolean
  isOrg: boolean
  profile: Profile
}) => {
  const { t } = useTranslation("editProfile")

  const isProfilePublic = profile.public

  return (
    <Col
      className={
        isOrg
          ? `d-flex w-100 justify-content-start`
          : `d-flex w-100 justify-content-end`
      }
    >
      <div>
        <Internal href="/editprofile" className="view-edit-profile">
          <StyledButton1 className={`btn mb-1 py-1`}>
            {t("forms.editProfile")}
          </StyledButton1>
        </Internal>
        <StyledButton2
          className={`w-100 btn-sm d-flex justify-content-center ms-auto py-1 ${
            isProfilePublic ? "btn-outline-secondary" : "btn-secondary"
          }`}
          // onClick={() => setIsProfilePublic(isProfilePublic ? false : true)}
        >
          {isProfilePublic ? t("forms.makePrivate") : t("forms.makePublic")}
        </StyledButton2>
      </div>
    </Col>
  )
}
