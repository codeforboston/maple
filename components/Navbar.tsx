import { useTranslation } from "next-i18next"
import React, { useContext, useState } from "react"
import Image from "react-bootstrap/Image"
import styled from "styled-components"
import { useMediaQuery } from "usehooks-ts"
import { SignInWithButton, signOutAndRedirectToHome, useAuth } from "./auth"
import { Col, Container, Dropdown, Nav, Navbar, NavDropdown } from "./bootstrap"
import { TabContext } from "./shared/ProfileTabsContext"

import {
  Avatar,
  NavbarLinkAI,
  NavbarLinkBills,
  NavbarLinkEditProfile,
  NavbarLinkEffective,
  NavbarLinkFAQ,
  NavbarLinkGoals,
  NavbarLinkLogo,
  NavbarLinkNewsfeed,
  NavbarLinkProcess,
  NavbarLinkSignOut,
  NavbarLinkSupport,
  NavbarLinkTeam,
  NavbarLinkTestimony,
  NavbarLinkViewProfile,
  NavbarLinkWhyUse
} from "./NavbarComponents"

export const MainNavbar: React.FC<React.PropsWithChildren<unknown>> = () => {
  const isMobile = useMediaQuery("(max-width: 768px)")

  return <>{isMobile ? <MobileNav /> : <DesktopNav />}</>
}

const MobileNav: React.FC<React.PropsWithChildren<unknown>> = () => {
  const BlackCollapse = styled(() => {
    return (
      <Navbar.Collapse id="basic-navbar-nav" className="bg-black mt-2 ps-4">
        {/* while MAPLE is trying to do away with inline styling,   *
         *  both styled-components and bootstrap classes have been  *
         *  ignoring height properties for some reason              */}
        <div style={{ height: "100vh" }}>
          {whichMenu == "site" ? <SiteLinks /> : <ProfileLinks />}
        </div>
      </Navbar.Collapse>
    )
  })`
    .bg-black {
      background-color: black;
    }
  `

  const { tabStatus, setTabStatus } = useContext(TabContext)

  const ProfileLinks = () => {
    return (
      <Nav className="my-4 d-flex align-items-start">
        <NavbarLinkViewProfile />
        <NavbarLinkEditProfile
          handleClick={() => {
            setTabStatus("AboutYou")
            closeNav()
          }}
          tab={"navigation.editProfile"}
        />
        <NavbarLinkEditProfile
          handleClick={() => {
            setTabStatus("Following")
            closeNav()
          }}
          tab={"navigation.followingTab"}
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
      <Nav className="my-4">
        <NavbarLinkBills handleClick={closeNav} />
        <NavbarLinkTestimony handleClick={closeNav} />
        {authenticated ? <NavbarLinkNewsfeed handleClick={closeNav} /> : <></>}
        <NavDropdown className={"navLink-primary"} title={t("about")}>
          <NavbarLinkGoals handleClick={closeNav} />
          <NavbarLinkTeam handleClick={closeNav} />
          <NavbarLinkSupport handleClick={closeNav} />
          <NavbarLinkFAQ handleClick={closeNav} />
          <NavbarLinkAI handleClick={closeNav} />
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

  return (
    <Navbar
      bg="secondary"
      className={`w-100 ${isExpanded ? "pb-0" : ""}`}
      data-bs-theme="dark"
      expand="lg"
      expanded={isExpanded}
    >
      <Col className="ms-3 ps-2">
        <Navbar.Brand onClick={toggleSite}>
          {isExpanded && whichMenu == "site" ? (
            <Image
              src="/Union.svg"
              alt={t("navigation.closeNavMenu")}
              width="35"
              height="35"
              className="ms-2"
            />
          ) : (
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
          )}
        </Navbar.Brand>
      </Col>
      <Col className="d-flex justify-content-center">
        <NavbarLinkLogo handleClick={closeNav} />
      </Col>
      <Col className="d-flex justify-content-end me-3 pe-2">
        {authenticated ? (
          <Navbar.Brand onClick={toggleAvatar}>
            <Nav.Link className="p-0 text-white">
              {isExpanded && whichMenu == "profile" ? (
                <Image
                  src="/Union.svg"
                  alt={t("navigation.closeProfileMenu")}
                  width="35"
                  height="35"
                />
              ) : (
                <Avatar />
              )}
            </Nav.Link>
          </Navbar.Brand>
        ) : (
          <SignInWithButton />
        )}
      </Col>

      <BlackCollapse />
    </Navbar>
  )
}

const DesktopNav: React.FC<React.PropsWithChildren<unknown>> = () => {
  const { authenticated } = useAuth()
  const { t } = useTranslation(["common", "auth"])

  const { tabStatus, setTabStatus } = useContext(TabContext)

  return (
    <Container fluid className={`bg-secondary d-flex py-2 sticky-top`}>
      <NavbarLinkLogo />

      <div className={`align-self-center flex-grow-1 invisible`}>
        <button className={`bg-light col my-2 w-100`}>
          <div className={`text-dark`}>{"Placeholder Search Widget"}</div>
        </button>
      </div>

      <div className={`align-self-center ms-3`}>
        <Nav>
          <NavbarLinkBills />
        </Nav>
      </div>

      <div className="align-self-center">
        <Nav>
          <NavbarLinkTestimony />
        </Nav>
      </div>

      {authenticated ? (
        <div className="align-self-center">
          <Nav>
            <NavbarLinkNewsfeed />
          </Nav>
        </div>
      ) : (
        <></>
      )}

      <div className={`align-self-center`}>
        <Dropdown>
          <Dropdown.Toggle className={`btn-secondary text-white-50`}>
            {t("about")}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <NavbarLinkGoals />
            <NavbarLinkTeam />
            <NavbarLinkSupport />
            <NavbarLinkFAQ />
            <NavbarLinkAI />
          </Dropdown.Menu>
        </Dropdown>
      </div>

      <div className={`align-self-center justify-content-end`}>
        <Dropdown>
          <Dropdown.Toggle className={`btn-secondary text-white-50`}>
            {t("learn")}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <NavbarLinkEffective />
            <NavbarLinkProcess />
            <NavbarLinkWhyUse />
          </Dropdown.Menu>
        </Dropdown>
      </div>

      {authenticated ? (
        <div className={`align-self-center justify-content-end`}>
          <Dropdown>
            <Dropdown.Toggle className={`btn-secondary`}>
              <Avatar />
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <NavDropdown.Item>
                <NavbarLinkViewProfile />
              </NavDropdown.Item>
              <NavDropdown.Item>
                <NavbarLinkEditProfile
                  handleClick={() => {
                    setTabStatus("AboutYou")
                  }}
                  tab={"navigation.editProfile"}
                />
              </NavDropdown.Item>
              <NavDropdown.Item>
                <NavbarLinkEditProfile
                  handleClick={() => {
                    setTabStatus("Following")
                  }}
                  tab={"navigation.followingTab"}
                />
              </NavDropdown.Item>
              <NavDropdown.Item>
                <NavbarLinkSignOut
                  handleClick={() => {
                    void signOutAndRedirectToHome()
                  }}
                />
              </NavDropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      ) : (
        <div className={`align-self-center justify-content-end`}>
          <SignInWithButton />
        </div>
      )}
    </Container>
  )
}
