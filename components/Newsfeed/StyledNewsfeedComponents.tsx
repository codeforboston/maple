import styled from "styled-components"
import { Container, Image, Col, Row } from "../bootstrap"

export const Header = styled(Row)`
  align-items: center;
  margin: 2.5rem 0;
  padding-right: 0;
  padding-left: 0;
`

export const HeaderTitle = styled(Col)`
  font-family: "Nunito";
  font-style: normal;
  font-weight: 600;
  font-size: 61px;
  line-height: 125%;

  letter-spacing: -0.03em;
  color: #000000;
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
  .checkbox {
    width: 187px;
    padding: 0px;
    color: #12266f;
  }

  .checkbox input {
    height: 16px;
    width: 16px;

    background-color: transparent;
    border-color: #12266f;
  }

  .checkbox input:checked {
    background-color: #12266f;
  }

  @media (min-width: 768px) {
  }
`
