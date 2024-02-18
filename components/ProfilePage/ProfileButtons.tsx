import { Role } from "components/auth/types"
import { Internal } from "components/links"
import { useTranslation } from "next-i18next"
import { Button } from "../bootstrap"
import styled from "styled-components"
import { FillButton, ToggleButton } from "components/buttons"

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
type Props = {
  formUpdated: boolean
  uid: string
  role: Role
}

export const ProfileEditToggle = ({ formUpdated, uid, role }: Props) => {
  const { t } = useTranslation(["profile", "editProfile"])
  return (
    <Button
      className={`btn-lg py-1 ml-2 text-decoration-none`}
      disabled={!!formUpdated}
      href={`/ profile ? id = ${uid} `}
    >
      {role !== "organization" ? t("viewMyProfile") : t("viewOrgProfile")}
    </Button>
  )
}
