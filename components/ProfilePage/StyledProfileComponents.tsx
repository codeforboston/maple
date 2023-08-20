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

export const UserIconLarge = ({ alt, src }: { alt: string; src: string }) => {
  const BaseUserIconLarge = styled(Image).attrs(props => ({
    alt: alt,
    src: src || "/profile-individual-icon.svg",
    className: props.className
  }))`
    height: 7rem;
    border-radius: 50%;
    background-color: var(--bs-white);
    flex: 0;
    margin-right: 2rem;
  `

  return <BaseUserIconLarge />
}

export const UserIconSmall = ({ alt, src }: { alt: string; src: string }) => {
  const BaseUserIconSmall = styled(Image).attrs(props => ({
    alt: alt,
    src: src || "/profile-individual-icon.svg",
    className: props.className
  }))`
    height: 5rem;
    border-radius: 50%;
    background-color: var(--bs-white);
    flex: 0;
    margin-right: 2rem;
  `

  return <BaseUserIconSmall />
}

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

export const OrgIconLarge = ({ alt, src }: { alt: string; src: string }) => {
  const BaseOrgIconLarge = styled(Image).attrs(props => ({
    alt: alt,
    src: src || "/profile-org-icon.svg",
    className: props.className
  }))`
    height: 8rem;
    margin-right: 2rem;
    border-radius: 50%;
    background-color: var(--bs-white);
    flex: 0;
  `

  return <BaseOrgIconLarge />
}

export const OrgIconSmall = ({ alt, src }: { alt: string; src: string }) => {
  const BaseOrgIconSmall = styled(Image).attrs(props => ({
    alt: alt,
    src: src || "/profile-org-icon.svg",
    className: props.className
  }))`
    height: 5rem;
    margin-right: 2rem;
    border-radius: 50%;
    background-color: var(--bs-white);
    flex: 0;
  `

  return <BaseOrgIconSmall />
}

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
