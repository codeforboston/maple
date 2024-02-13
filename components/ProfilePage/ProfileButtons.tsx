import { Internal } from "components/links"
import { useTranslation } from "next-i18next"
import { Button } from "react-bootstrap"
import styled from "styled-components"

export const StyledButton = styled(Button).attrs(props => ({
  className: `col-12 d-flex align-items-center justify-content-center py-3 text-nowrap`
}))`
  height: 34px;
  /* width: 116px; */

  @media (max-width: 768px) {
    position: relative;
    width: 100%;
    /* top: -9px; */
  }
`

export const ToggleProfilePrivate = styled(StyledButton).attrs(props => ({
  className: `${
    props.isProfilePublic ? "btn-secondary" : "btn-outline-secondary"
  } col-12`
}))`
  ${props =>
    props.isProfilePublic
      ? `&:focus {
    color: var(--bs-secondary);
    background-color: white;
    border-color: var(--bs-secondary);
  }
  &:hover {
    color: white;
    background-color: var(--bs-secondary);
    border-color: white;
  }`
      : `background-color: white;   
    &:focus{
      color: white;
      background-color:var(--bs-secondary);
      border-color: white;
    }
    &:hover{
      color: var(--bs-secondary);
      background-color: white;
      border-color: var(--bs-secondary);
    }`}
`

export const EditProfileButton = () => {
  const { t } = useTranslation("profile")

  return (
    <Internal
      href="/editprofile"
      className="text-decoration-none text-white col-12"
    >
      <StyledButton>{t("button.editProfile")}</StyledButton>
    </Internal>
  )
}
