import { useTranslation } from "next-i18next"
import React, { useState } from "react"
import Image from "react-bootstrap/Image"
import styled from "styled-components"
import { useMediaQuery } from "usehooks-ts"
import { SignInWithButton, signOutAndRedirectToHome, useAuth } from "./auth"
import { Col, Container, Dropdown, Nav, Navbar, NavDropdown } from "./bootstrap"
import { flags } from "./featureFlags"

import {
  Avatar,
  NavbarLinkBallotQuestions,
  DESKTOP_NAV_ITEM_CLASS,
  NavbarLinkAI,
  NavbarLinkBills,
  NavbarLinkAiTools,
  NavbarLinkEffective,
  NavbarLinkHearings,
  NavbarLinkProcess,
  NavbarLinkWhyUse,
  NavbarLinkEditProfile,
  NavbarLinkFAQ,
  NavbarLinkGoals,
  NavbarLinkInTheNews,
  NavbarLinkLogo,
  NavbarLinkNewsfeed,
  NavbarLinkSignOut,
  NavbarLinkSupport,
  NavbarLinkTeam,
  NavbarLinkTestimony,
  NavbarLinkViewProfile
} from "./NavbarComponents"

const MobileCollapse = styled(Navbar.Collapse)`
  background-color: var(--maple-brand-primary);
`

export const MainNavbar: React.FC<React.PropsWithChildren<unknown>> = () => {
  const isMobile = useMediaQuery("(max-width: 768px)")

  return <>{isMobile ? <MobileNav /> : <DesktopNav />}</>
}

const MobileNav: React.FC<React.PropsWithChildren<unknown>> = () => {
  const ProfileLinks = () => {
    return (
      <Nav className="my-4 d-flex align-items-start">
        <NavbarLinkViewProfile handleClick={closeNav} />
        <NavbarLinkEditProfile
          handleClick={() => {
            closeNav()
          }}
          tab={"navigation.editProfile"}
        />
        <NavbarLinkEditProfile
          handleClick={() => {
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
        {flags().ballotQuestions ? (
          <NavbarLinkBallotQuestions handleClick={closeNav} />
        ) : null}
        {flags().hearingsAndTranscriptions ? (
          <NavbarLinkHearings handleClick={closeNav} />
        ) : null}
        <NavbarLinkTestimony handleClick={closeNav} />
        {authenticated ? <NavbarLinkNewsfeed handleClick={closeNav} /> : <></>}
        <NavDropdown className={"navLink-primary"} title={t("about")}>
          <NavbarLinkGoals handleClick={closeNav} />
          <NavbarLinkTeam handleClick={closeNav} />
          <NavbarLinkSupport handleClick={closeNav} />
          <NavbarLinkFAQ handleClick={closeNav} />
          <NavbarLinkAI handleClick={closeNav} />
          <NavbarLinkInTheNews handleClick={closeNav} />
        </NavDropdown>

        <NavDropdown className={"navLink-primary"} title={t("learn")}>
          <NavbarLinkEffective handleClick={closeNav} />
          <NavbarLinkProcess handleClick={closeNav} />
          <NavbarLinkWhyUse handleClick={closeNav} />
          <NavbarLinkAiTools handleClick={closeNav} />
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
      className={`main-navbar w-100 ${isExpanded ? "pb-0" : ""}`}
      style={{ backgroundColor: "var(--maple-brand-primary)" }}
      data-bs-theme="dark"
      expand="lg"
      expanded={isExpanded}
    >
      <Col className="ms-3 ps-2">
        <button
          type="button"
          onClick={toggleSite}
          aria-controls="basic-navbar-nav"
          aria-expanded={isExpanded && whichMenu === "site"}
          aria-label={
            isExpanded && whichMenu === "site"
              ? t("navigation.closeNavMenu")
              : t("navigation.openNavMenu")
          }
          className="mobile-nav-trigger"
        >
          {isExpanded && whichMenu == "site" ? (
            <span className="mobile-nav-close-icon" aria-hidden="true" />
          ) : (
            <span className="navbar-toggler-icon" aria-hidden="true" />
          )}
        </button>
      </Col>
      <Col className="d-flex justify-content-center">
        <NavbarLinkLogo handleClick={closeNav} />
      </Col>
      <Col className="d-flex justify-content-end me-3 pe-2">
        {authenticated ? (
          <button
            type="button"
            onClick={toggleAvatar}
            aria-controls="basic-navbar-nav"
            aria-expanded={isExpanded && whichMenu === "profile"}
            aria-label={
              isExpanded && whichMenu === "profile"
                ? t("navigation.closeProfileMenu")
                : t("navigation.openProfileMenu")
            }
            className="mobile-nav-trigger"
          >
            <span
              className="p-0 d-inline-flex"
              style={{ color: "var(--maple-brand-primary-strong)" }}
            >
              {isExpanded && whichMenu == "profile" ? (
                <span className="mobile-nav-close-icon" aria-hidden="true" />
              ) : (
                <Avatar />
              )}
            </span>
          </button>
        ) : (
          <SignInWithButton />
        )}
      </Col>

      <MobileCollapse id="basic-navbar-nav" className="mt-2 ps-4">
        {/* while MAPLE is trying to do away with inline styling,   *
         *  both styled-components and bootstrap classes have been  *
         *  ignoring height properties for some reason              */}
        <div style={{ height: "100vh" }}>
          {whichMenu == "site" ? <SiteLinks /> : <ProfileLinks />}
        </div>
      </MobileCollapse>
    </Navbar>
  )
}

const DesktopNav: React.FC<React.PropsWithChildren<unknown>> = () => {
  const { authenticated } = useAuth()
  const { t } = useTranslation(["common", "auth"])

  return (
    <Container
      fluid
      className={`main-navbar desktop-navbar d-flex py-2 sticky-top justify-content-end gap-2`}
      style={{ backgroundColor: "var(--maple-brand-primary)" }}
    >
      <div className={`me-auto`}>
        <NavbarLinkLogo />
      </div>

      <div className={`align-self-center`}>
        <NavbarLinkBills />
      </div>

      {flags().ballotQuestions ? (
        <div className={`align-self-center`}>
          <NavbarLinkBallotQuestions />
        </div>
      ) : null}

      {flags().hearingsAndTranscriptions ? (
        <div className={`align-self-center`}>
          <NavbarLinkHearings />
        </div>
      ) : (
        <></>
      )}

      <div className="align-self-center">
        <NavbarLinkTestimony />
      </div>

      {authenticated ? (
        <div className="align-self-center">
          <NavbarLinkNewsfeed />
        </div>
      ) : (
        <></>
      )}

      <div className={`align-self-center`}>
        <Dropdown>
          <Dropdown.Toggle
            variant="light"
            className={`${DESKTOP_NAV_ITEM_CLASS}`}
          >
            {t("about")}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <NavbarLinkGoals />
            <NavbarLinkTeam />
            <NavbarLinkSupport />
            <NavbarLinkFAQ />
            <NavbarLinkAI />
            <NavbarLinkInTheNews />
          </Dropdown.Menu>
        </Dropdown>
      </div>

      <div className={`align-self-center`}>
        <Dropdown>
          <Dropdown.Toggle
            variant="light"
            className={`${DESKTOP_NAV_ITEM_CLASS}`}
          >
            {t("learn")}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <NavbarLinkEffective />
            <NavbarLinkProcess />
            <NavbarLinkWhyUse />
            <NavbarLinkAiTools />
          </Dropdown.Menu>
        </Dropdown>
      </div>

      {authenticated ? (
        <div className={`align-self-center`}>
          <Dropdown>
            <Dropdown.Toggle
              variant="light"
              className={`desktop-navbar-dropdown`}
            >
              <Avatar />
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <NavbarLinkViewProfile dropdown />
              <NavbarLinkEditProfile dropdown tab={"navigation.editProfile"} />
              <NavbarLinkEditProfile dropdown tab={"navigation.followingTab"} />
              <NavbarLinkSignOut
                dropdown
                handleClick={() => {
                  void signOutAndRedirectToHome()
                }}
              />
            </Dropdown.Menu>
          </Dropdown>
        </div>
      ) : (
        <div className={`align-self-center`}>
          <SignInWithButton />
        </div>
      )}
    </Container>
  )
}
