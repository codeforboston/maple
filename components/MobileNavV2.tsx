import { useTranslation } from "next-i18next"
import React, { FC, useState } from "react"
import { SignInWithButton, signOutAndRedirectToHome, useAuth } from "./auth"
import { Container, Nav, Navbar, NavDropdown } from "./bootstrap"
import { useProfile } from "./db"
import {
  Avatar,
  NavbarLinkBills,
  NavbarLinkEditProfile,
  NavbarLinkEffective,
  NavbarLinkFAQ,
  NavbarLinkGoals,
  NavbarLinkLogo,
  NavbarLinkProcess,
  NavbarLinkSignOut,
  NavbarLinkSupport,
  NavbarLinkTeam,
  NavbarLinkTestimony,
  NavbarLinkViewProfile,
  NavbarLinkWhyUse
} from "./NavbarComponents"

import { Col, Row } from "./bootstrap"

const NavBarBoxContainer: FC<
  React.PropsWithChildren<{ className?: string }>
> = ({ children, className }) => {
  return (
    <div
      className={`d-flex flex-row align-items-start justify-content-between w-100`}
    >
      {children}
    </div>
  )
}

const NavBarBox: FC<React.PropsWithChildren<{ className?: string }>> = ({
  children,
  className
}) => {
  return (
    <div
      className={`col d-flex justify-content-start align-items-center ${className}`}
    >
      {children}
    </div>
  )
}

export const MobileNavV2: React.FC<React.PropsWithChildren<unknown>> = () => {
  const { authenticated } = useAuth()
  const [isExpanded, setIsExpanded] = useState(false)
  const { t } = useTranslation(["common", "auth"])

  const toggleNav = () => setIsExpanded(!isExpanded)
  const closeNav = () => setIsExpanded(false)

  const result = useProfile()
  let isOrg = result?.profile?.role === "organization"

  return (
    <>
      <div
        className={`d-flex flex-row align-items-start justify-content-between w-100`}
      >
        <Col>
          <Navbar
            bg="secondary"
            expand="lg"
            // className="bg-body-tertiary"
            // variant="dark"
            data-bs-theme="dark"
          >
            <Container>
              <Navbar.Brand href="#home">
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
              </Navbar.Brand>
              <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="d-flex align-items-end">
                  <Nav.Link href="#home">Home</Nav.Link>
                  <Nav.Link href="#link">Link</Nav.Link>
                  <NavDropdown title="Dropdown" id="basic-nav-dropdown">
                    <NavDropdown.Item href="#action/3.1">
                      Action
                    </NavDropdown.Item>
                    <NavDropdown.Item href="#action/3.2">
                      Another action
                    </NavDropdown.Item>
                    <NavDropdown.Item href="#action/3.3">
                      Something
                    </NavDropdown.Item>
                    <NavDropdown.Divider />
                    <NavDropdown.Item href="#action/3.4">
                      Separated link
                    </NavDropdown.Item>
                  </NavDropdown>
                </Nav>
              </Navbar.Collapse>
            </Container>
          </Navbar>
        </Col>
        <Col>
          <div className="d-flex justify-content-center">
            <NavbarLinkLogo />
          </div>
        </Col>
        <Col>
          <div>
            <Navbar
              bg="secondary"
              expand="lg"
              // variant="dark"
              data-bs-theme="dark"
            >
              <Container className="d-flex justify-content-end">
                <Navbar.Brand href="#home">
                  <Nav>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                  </Nav>
                </Navbar.Brand>
                <Navbar.Collapse id="profile-nav">
                  <Nav className="me-4 d-flex align-items-end">
                    <NavbarLinkViewProfile />
                    <NavbarLinkEditProfile
                      handleClick={() => {
                        closeNav()
                      }}
                    />
                    <NavbarLinkSignOut
                      handleClick={() => {
                        closeNav()
                        void signOutAndRedirectToHome()
                      }}
                    />
                  </Nav>
                </Navbar.Collapse>
              </Container>
            </Navbar>
          </div>
        </Col>
      </div>

      {/* <Navbar
        bg="secondary"
        expand="lg"
        // className="bg-body-tertiary"
        // variant="dark"
        data-bs-theme="dark"
      >
        <Container>
          <Navbar.Brand href="#home">
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
          </Navbar.Brand>
          <NavbarLinkLogo />
          <Navbar.Brand href="#home">
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
          </Navbar.Brand>
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link href="#home">Home</Nav.Link>
              <Nav.Link href="#link">Link</Nav.Link>
              <NavDropdown title="Dropdown" id="basic-nav-dropdown">
                <NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item>
                <NavDropdown.Item href="#action/3.2">
                  Another action
                </NavDropdown.Item>
                <NavDropdown.Item href="#action/3.3">
                  Something
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item href="#action/3.4">
                  Separated link
                </NavDropdown.Item>
              </NavDropdown>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar> */}

      {/* <Navbar
        bg="secondary"
        expand="lg"
        // className="bg-body-tertiary"
        // variant="dark"
        data-bs-theme="dark"
      >
        <Container>
          <Navbar.Brand href="#home">
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
          </Navbar.Brand>
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link href="#home">Home</Nav.Link>
              <Nav.Link href="#link">Link</Nav.Link>
              <NavDropdown title="Dropdown" id="basic-nav-dropdown">
                <NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item>
                <NavDropdown.Item href="#action/3.2">
                  Another action
                </NavDropdown.Item>
                <NavDropdown.Item href="#action/3.3">
                  Something
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item href="#action/3.4">
                  Separated link
                </NavDropdown.Item>
              </NavDropdown>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar> */}
    </>
  )
}
