import styled from "styled-components"
import { Container } from "../bootstrap"

export const FooterContainer = styled(Container)`
  .navbar {
    flex-grow: 1;
  }

  .navbar-nav {
    flex-grow: 1;
  }

  .dropdown-toggle {
    width: 100%;
    display: flex;
    flex-grow: 1;
    justify-content: space-between;
    color: rgba(255, 255, 255, 1);
  }

  .navbar-dark .navbar-nav .nav-link {
    color: rgba(255, 255, 255, 0.55);
  }

  .navbar-dark .navbar-nav,
  .navbar-dark .navbar-nav .nav-link.active,
  .navbar-dark .navbar-nav .nav-link:hover {
    color: rgba(255, 255, 255, 1);
  }

  .dropdown-toggle::after,
  .dropdown-toggle[aria-expanded="true"]::after {
    width: 25px;
    padding: 0;
    border: none;
    color: transparent;
    border: none;
    background: url("/angle-right-solid.svg") no-repeat;
    background-size: 0.75em;
    background-position: right;
  }

  .dropdown-toggle[aria-expanded="true"]::after {
    background: url("/angle-down-solid.svg") no-repeat;
    background-position: right;
  }

  .dropdown-menu {
    transition: 0.4s;
  }

  .dropdown-menu.show {
    background-color: #000;
    transition-timing-function: ease;
  }
`
