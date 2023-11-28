import styled from "styled-components"
import { Container, Image, Col, Row } from "../bootstrap"

export const StyledImage = styled(Image)`
  width: 14.77px;
  height: 12.66px;
  margin-left: 8px;
`

export const Header = styled(Row)`
  font-size: 39px;
  font-family: Nunito;
  font-weight: 500;
  align-items: center;
  margin: 2.5rem 0;
  padding-right: 0;
  padding-left: 0;
`
export const ContactInfoRow = styled(Row)`
  font-size: 1.375rem;
  font-family: Nunito;
  font-weight: 500;
`

const BaseProfileIcon = styled(Image)`
  border-radius: 50%;
  background-color: var(--bs-white);
  flex: 0;
  margin-right: 2rem;
`

const BaseUserIcon = ({
  alt = "User Icon",
  src = "/profile-individual-icon.svg",
  className
}: {
  alt?: string
  src?: string
  className?: string
}) => <BaseProfileIcon alt={alt} src={src} className={className} />

const BaseOrgIcon = ({
  alt = "Organization Icon",
  src = "/profile-org-icon.svg",
  className
}: {
  alt?: string
  src?: string
  className?: string
}) => <BaseProfileIcon alt={alt} src={src} className={className} />

export const UserIconLarge = styled(BaseUserIcon)`
  height: 7rem;
`

export const UserIconSmall = styled(BaseUserIcon)`
  height: 5rem;
`
export const OrgIconLarge = styled(BaseOrgIcon)`
  height: 8rem;
`
export const OrgIconSmall = styled(BaseOrgIcon)`
  height: 5rem;
`

export const ProfileDisplayName = styled(Col).attrs(props => ({
  className: `${props.className}`
}))`
  margin: 0;
  max-height: 108px;
  font-family: Nunito;
  font-weight: 500;
  font-size: 39px;
  letter-spacing: -0.015em;
  text-align: left;
  color: #000;

  .firstName {
    font-size: 1.5rem;
  }

  .lastName {
    font-size: 2.75rem;
  }
`

export const ProfileDisplayNameSmall = styled(Col).attrs(props => ({
  className: `${props.className}`
}))`
  margin: 0;
  font-family: Nunito;
  font-weight: 500;
  font-size: 29px;
  letter-spacing: -0.015em;
  text-align: left;
  color: #000;
`

export const StyledContainer = styled(Container)`
  .about-me-checkbox input {
    height: 25px;
    width: 25px;
    margin-top: 0;
    border-color: #12266f;
  }

  .input-social-media::placeholder {
    font-size: 12px;
  }

  .save-profile-button > button {
    width: 100%;
  }

  .edit-profile-header {
    flex-direction: column !important;
    height: auto;
  }

  .your-legislators-width {
    width: 100%;
  }

  .view-edit-profile,
  .follow-button {
    width: 100%;
    text-decoration: none;
  }

  .view-edit-profile > button,
  .follow-button > button {
    width: 100%;
  }

  @media (min-width: 768px) {
    .edit-profile-header {
      flex-direction: row !important;
    }

    .your-legislators-width {
      width: 50%;
    }

    .save-profile-button {
      align-self: flex-end;
      width: auto;
    }

    .view-edit-profile {
      display: flex;
      justify-content: flex-end;
    }

    .view-edit-profile > button {
      width: auto;
    }

    .follow-button > button {
      width: unset;
    }
  }
`
