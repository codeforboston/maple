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
    color: var(--maple-text-inverse);
  }

  .navbar-dark .navbar-nav .nav-link {
    color: var(--maple-text-inverse-muted);
  }

  .navbar-dark .navbar-nav,
  .navbar-dark .navbar-nav .nav-link.active,
  .navbar-dark .navbar-nav .nav-link:hover {
    color: var(--maple-text-inverse);
  }

  .dropdown-toggle::after,
  .dropdown-toggle[aria-expanded="true"]::after {
    width: 25px;
    padding: 0;
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

  /* The rules between the mobile dropdowns
     (components/Footer/CustomFooterDropdown.tsx) softer than its 75%. */
  [data-maple-theme="dd"] & .border-bottom.border-white {
    --bs-border-opacity: 0.35;
  }

  /* The mobile dropdowns' titles in full white, not the muted white of the
     links. */
  [data-maple-theme="dd"] & .navbar-nav .nav-link.dropdown-toggle {
    color: var(--maple-text-inverse);
  }

  /* Smaller arrows, the same size open or closed. Sized by height, since the
     two images are framed at different widths. */
  [data-maple-theme="dd"] & .dropdown-toggle::after,
  [data-maple-theme="dd"] & .dropdown-toggle[aria-expanded="true"]::after {
    background-size: auto 0.9em;
    background-position: right center;
  }

  .dropdown-menu {
    transition: 0.4s;
  }

  .dropdown-menu.show {
    background-color: #000;
    transition-timing-function: ease;
  }
`
