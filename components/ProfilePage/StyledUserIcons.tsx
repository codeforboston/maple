import { Role } from "common/auth/types"
import { Image } from "components/bootstrap"
import styled from "styled-components"
import { useTranslation } from "next-i18next"

type ProfileIconProps = {
  profileImage?: string
  role?: Role
  className?: string
  large?: boolean
  size?: "small" | "large"
}

export const BaseProfileIcon = ({
  profileImage,
  role,
  className
}: ProfileIconProps) => {
  const { t } = useTranslation("auth")

  let iconSrc
  switch (role) {
    case "organization": {
      iconSrc = "/profile-org-icon.svg"
      break
    }
    default:
      iconSrc = "/profile-individual-icon.svg"
      break
  }
  return (
    <Image src={iconSrc} className={`${className}`} alt={t("profileIcon")} />
  )
}

export const ProfileIcon = styled(BaseProfileIcon).attrs<{ large: boolean }>(
  props => ({})
)`
  height: ${({ large }) => (large ? "7rem" : "5rem")};
  width: ${({ large }) => (large ? "7rem" : "5rem")};
  border-radius: 50%;
  background-color: var(--bs-white);
`
