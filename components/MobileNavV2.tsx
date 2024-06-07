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
  const ProfileLinks = () => {
    return (
      <Nav className="me-4 d-flex align-items-start">
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
    )
  }

  const SiteLinks = () => {
    return (
      <Nav>
        <NavbarLinkBills handleClick={closeNav} />
        <NavbarLinkTestimony handleClick={closeNav} />

        <NavDropdown className={"navLink-primary"} title={t("about")}>
          <NavbarLinkGoals handleClick={closeNav} />
          <NavbarLinkTeam handleClick={closeNav} />
          <NavbarLinkSupport handleClick={closeNav} />
          <NavbarLinkFAQ handleClick={closeNav} />
        </NavDropdown>

        <NavDropdown className={"navLink-primary"} title={t("learn")}>
          <NavbarLinkEffective handleClick={closeNav} />
          <NavbarLinkProcess handleClick={closeNav} />
          <NavbarLinkWhyUse handleClick={closeNav} />
        </NavDropdown>
      </Nav>
    )
  }

  const { authenticated } = useAuth()
  const [isExpanded, setIsExpanded] = useState(false)
  const [whichMenu, setWhichMenu] = useState("site")
  const { t } = useTranslation(["common", "auth"])

  const toggleSite = () => {
    if (isExpanded && whichMenu == "profile") {
      setWhichMenu("site")
    } else {
      setWhichMenu("site")
      setIsExpanded(!isExpanded)
    }
  }

  const toggleAvatar = () => {
    if (isExpanded && whichMenu == "site") {
      setWhichMenu("profile")
    } else {
      setWhichMenu("profile")
      setIsExpanded(!isExpanded)
    }
  }

  const closeNav = () => setIsExpanded(false)

  const result = useProfile()
  let isOrg = result?.profile?.role === "organization"

  console.log("Is Expanded? ", isExpanded)
  console.log("Which Menu? ", whichMenu)

  return (
    <>
      <Navbar
        bg="secondary"
        data-bs-theme="dark"
        expand="lg"
        expanded={isExpanded}
      >
        <Container>
          <Col>
            <Navbar.Brand href="#home">
              <Navbar.Toggle
                aria-controls="basic-navbar-nav"
                onClick={toggleSite}
              />
            </Navbar.Brand>
          </Col>
          <Col>
            <div className="d-flex justify-content-center">
              <NavbarLinkLogo />
            </div>
          </Col>
          <Col className="d-flex justify-content-end">
            {authenticated ? (
              <>
                <Navbar.Brand onClick={toggleAvatar}>
                  <Nav.Link className="p-0 text-white">
                    <Avatar isOrg={isOrg} />
                  </Nav.Link>
                </Navbar.Brand>
              </>
            ) : (
              <SignInWithButton />
            )}
          </Col>

          <Navbar.Collapse id="basic-navbar-nav">
            {whichMenu == "site" ? <SiteLinks /> : <ProfileLinks />}
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  )
}
