import { TabContent } from "react-bootstrap"
import Image from "react-bootstrap/Image"
import styled from "styled-components"
import { Col, Nav, NavDropdown, Row } from "../bootstrap"

export const StyledTabNav = styled(Nav).attrs(props => ({
  className: props.className
}))`
  display: flex;
  justify-content: center;
  height: 2.5em;

  .nav-item {
    width: 50%;
  }

  @media (min-width: 768px) {
    justify-content: flex-start;
    height: 2.25em;

    .nav-item {
      width: auto;
    }
  }

  text-align: center;
  margin: 0 1rem;
  font-family: Nunito;
  font-size: 1.25rem;
  color: var(--bs-dark);

  .nav-link.active {
    height: 4.4rem;
  }

  .nav-link {
    cursor: pointer;
    background-color: white;
    overflow: visible;
    width: auto;
    margin: 0 1rem;
  }

  .nav-link:first-child {
    margin-left: 0;
  }
`
export const StyledDropdownNav = styled(NavDropdown).attrs(props => ({
  className: props.className
}))`
  font-family: Nunito;
  font-size: 1.25rem;
  width: auto;
  margin: auto;

  .nav-link,
  a {
    height: 2.25em;
    width: fit-content;
    margin-left: 1rem;
    z-index: 1;
    color: var(--bs-dark);
    background-color: white;
    text-align: left;
  }

  .nav-item .active,
  a.active {
    background-color: white;
  }
`
export const StyledTabContent = styled(TabContent)`
  margin-top: -0.5rem;
  z-index: -1;
`

export const Header = styled(Row)`
  font-size: 3rem;
  font-family: Nunito;
  font-weight: 500;
  margin-right: 1rem;
  margin-left: 1rem;
  height: 16rem;
  align-items: center;
  /* flex-direction: column ; */

  /* @media only screen and (min-width: 576px) {
    flex-direction: row ;
  } */
`

export const ProfileDisplayName = styled(Col).attrs(props => ({
  className: `${props.className}`
}))`
  margin: 0;
  font-family: Nunito;
  font-weight: 500;
  letter-spacing: -0.63px;
  text-align: justify;
  color: #000;

  .firstName {
    font-size: 1.5rem;
  }

  .lastName {
    font-size: 2.75rem;
  }
`

export const UserIcon = styled(Image).attrs(props => ({
  alt: "",
  src: props.src || "/profile-icon.svg",
  className: props.className
}))`
  height: 8rem;
  width: 8rem;
  margin: 1rem;
  border-radius: 50%;
  background-color: var(--bs-blue);
  flex: 0;
`
export const VerifiedBadge = styled.div.attrs(props => ({
  className: props.className
}))`
  background-color: var(--bs-blue);
  border-radius: 70px;
  display: flex;
  padding: 3px 25.8px;
  justify-content: center;
  align-content: center;
  text-align: center;

  .verifiedText {
    font-size: 1rem;
    color: white;
    align-self: center;
    justify-self: center;
  }
`
