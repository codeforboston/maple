import styled from "styled-components"
import { Container, Image } from "../bootstrap"

export const StyledImage = styled(Image)`
  width: 14.77px;
  height: 12.66px;
  margin-left: 8px;
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
