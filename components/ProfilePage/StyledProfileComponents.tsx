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

`

export const Banner = styled(Row)`
  font-family: Nunito;
  font-size: 25px;
  text-align:center;
  justify-content: center;
  padding: 0.75rem;
  color: white;
  background-color: #FF8600

`

export const UserIcon = styled(Image).attrs(props => ({
  alt: "",
  src: props.src || "/profile-individual-icon.svg",
  className: props.className
}))`
  height: 7rem;
  border-radius: 50%;
  background-color: var(--bs-white);
  flex: 0;
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
export const OrgIconLarge = styled(Image).attrs(props => ({
  alt: "",
  src: props.src || "/profile-org-icon.svg",
  className: props.className
}))`
  height: 8rem;
  width: 8rem;
  margin: 1rem;
  border-radius: 50%;
  background-color: var(--bs-white);
  flex: 0;
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

  .view-edit-profile {
    width: 100%;
    text-decoration: none;
  }

  .view-edit-profile > button {
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
  }
`
