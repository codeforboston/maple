import { TabContent } from "react-bootstrap"
import Image from "react-bootstrap/Image"
import styled from "styled-components"
import { Col, Button, Nav, NavDropdown, Row } from "../bootstrap"

export const Banner = styled(Row)`
  font-family: Nunito;
  font-size: 25px;
  text-align: center;
  justify-content: center;
  padding: 0.75rem;
  color: white;
  background-color: #ff8600;
`

export const StyledTabNav = styled(Nav).attrs(props => ({
  className: props.className
}))`
  display: flex;

  height: 2.5em;
  margin-bottom: 1rem;

  .nav-item {
    flex-grow: 1;
    width: auto;
  }

  text-align: center;
  font-family: Nunito;
  font-size: 1.25rem;
  color: var(--bs-dark);

  .nav-link.active {
    color: #c71e32;
  }

  .nav-link {
    cursor: pointer;
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
  margin-top: 3.5rem;
  z-index: -1;

  @media (min-width: 329px) {
    margin-top: 2rem;
  }

  @media (min-width: 517px) {
    margin-top: -0.5rem;
  }
`

export const StyledHr = styled.hr`
  height: 2px !important;
  opacity: 100%;
`

export const Header = styled(Row)`
  font-size: 3rem;
  font-family: Nunito;
  font-weight: 500;
  margin-top: 3.5rem;
  margin-bottom: 3.5rem;
  align-items: center;
`
