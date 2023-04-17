import styled from "styled-components"
import { Container, Image, Col, Row } from "../bootstrap"

export const Header = styled(Row)`
  font-family: "Nunito";
  font-style: normal;
  font-weight: 600;
  font-size: 61px;
  line-height: 125%;

  letter-spacing: -0.03em;
  color: #000000;

  align-items: center;
  margin: 2.5rem 0;
  padding-right: 0;
  padding-left: 0;
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
  margin-right: 2rem;
`

export const StyledContainer = styled(Container)`
  .about-me-checkbox input {
    height: 25px;
    width: 25px;
    margin-top: 0;
    border-color: #12266f;
  }

  @media (min-width: 768px) {
  }
`
