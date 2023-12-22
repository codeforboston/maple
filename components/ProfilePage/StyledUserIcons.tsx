import { Image } from "components/bootstrap"
import styled from "styled-components"

type ProfileIconProps = {
  profileImage?: string
  isOrg?: boolean
  className?: string
  large?: boolean
}

export const ProfileIcon = ({
  profileImage,
  isOrg,
  className
}: ProfileIconProps) => {
  const defaultIconSrc: string = "/profile-individual-icon.svg"
  const defaultOrgIconSrc: string = "/profile-org-icon.svg"

  return (
    <Image
      src={profileImage || (isOrg ? defaultOrgIconSrc : defaultIconSrc)}
      className={`${className}`}
      alt="profile icon"
    />
  )
}

export const StyledProfileIcon = styled(ProfileIcon).attrs<{ large: boolean }>(
  props => ({})
)`
  height: ${({ large }) => (large ? "7rem" : "5rem")};
  width: ${({ large }) => (large ? "7rem" : "5rem")};
  border-radius: 50%;
  background-color: var(--bs-white);
`
