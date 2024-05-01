import { useTranslation } from "next-i18next"
import Head from "next/head"
import React, { FC, useEffect, useState } from "react"
import Image from "react-bootstrap/Image"
import styled from "styled-components"
import { useMediaQuery } from "usehooks-ts"
import { SignInWithButton, signOutAndRedirectToHome, useAuth } from "./auth"
import AuthModal from "./auth/AuthModal"
import { Container, Dropdown, Nav, NavDropdown, Navbar } from "./bootstrap"
import { useProfile } from "./db"
import PageFooter from "./Footer/Footer"
import { NavBarBox, NavBarBoxContainer } from "./layout"
import { NavLink } from "./Navlink"
import ProfileLink from "./ProfileLink"

export const DesktopNav: React.FC<React.PropsWithChildren<unknown>> = () => {
  const { authenticated, claims, user } = useAuth()
  const { profile } = useProfile()
  const [isExpanded, setIsExpanded] = useState(false)
  const { t } = useTranslation(["common", "auth"])

  const toggleNav = () => setIsExpanded(!isExpanded)
  const closeNav = () => setIsExpanded(false)

  const userLink = "/profile?id=" + user?.uid

  const LogoBox = styled.div`
    width: 100px;
  `

  const BrowseBox = styled.div`
    width: 126px;
  `

  const TestimonyBox = styled.div`
    width: 170px;
  `

  const AboutBox = styled.div`
    width: 90px;
  `

  const LearnBox = styled.div`
    width: 90px;
  `

  const ProfileBox = styled.div`
    width: 96px;
  `

  const LoginBox = styled.div`
    width: 150px;
  `

  return (
    <>
      {/* <Navbar
        bg="secondary"
        variant="dark"
        sticky="top"
        expand={false}
        expanded={isExpanded}
        data-bs-theme="dark"
      ></Navbar> */}
      <Container fluid className={`bg-secondary d-flex py-2 sticky-top`}>
        <LogoBox className={`align-items-center justify-content-start me-3`}>
          <Nav.Link href="/" className="py-0 px-2">
            <Image src="/Logo2024.png" alt="logo" width="80" height="80" />
          </Nav.Link>
        </LogoBox>

        <div className={`align-self-center flex-grow-1`}>
          <button className={`bg-light col my-2 w-100`}>
            <div className={`text-dark`}>Placeholder Search Widget</div>
          </button>
        </div>

        <BrowseBox className="align-self-center ms-3">
          <Nav>
            <NavLink
              className={"navLink-primary text-white-50"}
              href="/bills"
              handleClick={closeNav}
            >
              {t("navigation.browseBills")}
            </NavLink>
          </Nav>
        </BrowseBox>

        <TestimonyBox className="align-self-center">
          <Nav>
            <NavLink
              className={"navLink-primary text-white-50"}
              href="/testimony"
              handleClick={closeNav}
            >
              {t("navigation.browseTestimony")}
            </NavLink>
          </Nav>
        </TestimonyBox>

        <AboutBox className="align-self-center">
          <Dropdown>
            <Dropdown.Toggle className="btn-secondary text-white-50">
              {t("about")}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <NavDropdown.Item>
                <NavLink
                  href="/about/faq-page"
                  handleClick={closeNav}
                  className={"navLink-primary"}
                >
                  {t("navigation.faq")}
                </NavLink>
              </NavDropdown.Item>
              <NavDropdown.Item>
                <NavLink
                  href="/about/mission-and-goals"
                  handleClick={closeNav}
                  className={"navLink-primary"}
                >
                  {t("navigation.missionAndGoals")}
                </NavLink>
              </NavDropdown.Item>
              <NavDropdown.Item>
                <NavLink
                  href="/about/our-team"
                  handleClick={closeNav}
                  className={"navLink-primary"}
                >
                  {t("team")}
                </NavLink>
              </NavDropdown.Item>
              <NavDropdown.Item>
                <NavLink
                  href="/about/support-maple"
                  handleClick={closeNav}
                  className={"navLink-primary"}
                >
                  {t("navigation.supportMaple")}
                </NavLink>
              </NavDropdown.Item>
              <NavDropdown.Item>
                <NavLink
                  href="/policies"
                  handleClick={closeNav}
                  className={"navLink-primary"}
                >
                  {t("navigation.privacyAndConduct")}
                </NavLink>
              </NavDropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </AboutBox>

        <LearnBox className="align-self-center justify-content-end">
          <Dropdown>
            <Dropdown.Toggle className="btn-secondary text-white-50">
              {t("learn")}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <NavDropdown.Item>
                <NavLink
                  href="/learn/to-write-effective-testimony"
                  handleClick={closeNav}
                  className={"navLink-primary"}
                >
                  {t("navigation.toWriteEffectiveTestimony")}
                </NavLink>
              </NavDropdown.Item>
              <NavDropdown.Item>
                <NavLink
                  href="/learn/legislative-process"
                  handleClick={closeNav}
                  className={"navLink-primary"}
                >
                  {t("navigation.legislativeProcess")}
                </NavLink>
              </NavDropdown.Item>
              <NavDropdown.Item>
                <NavLink
                  href="/why-use-maple/for-individuals"
                  handleClick={closeNav}
                  className={"navLink-primary"}
                >
                  {t("navigation.forIndividuals")}
                </NavLink>
              </NavDropdown.Item>
              <NavDropdown.Item>
                <NavLink
                  href="/why-use-maple/for-orgs"
                  handleClick={closeNav}
                  className={"navLink-primary"}
                >
                  {t("navigation.forOrganizations")}
                </NavLink>
              </NavDropdown.Item>
              <NavDropdown.Item>
                <NavLink
                  className={"navLink-primary"}
                  href="/why-use-maple/for-legislators"
                  handleClick={closeNav}
                >
                  {t("navigation.forLegislators")}
                </NavLink>
              </NavDropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </LearnBox>

        {authenticated ? (
          <ProfileBox className={`align-items-center justify-content-end`}>
            <Dropdown>
              <Dropdown.Toggle className="btn-secondary">
                <Image
                  className="mx-2"
                  src="/profile-icon.svg"
                  alt="profile icon"
                />
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <NavDropdown.Item>
                  <NavLink
                    className={"navLink-primary"}
                    handleClick={() => {
                      location.assign(userLink)
                    }}
                  >
                    View Profile
                  </NavLink>
                </NavDropdown.Item>
                <NavDropdown.Item>
                  <NavLink
                    className={"navLink-primary"}
                    href="/editprofile"
                    handleClick={closeNav}
                  >
                    Edit Profile
                  </NavLink>
                </NavDropdown.Item>
                <NavDropdown.Item>
                  <NavLink
                    className={"navLink-primary"}
                    handleClick={() => {
                      closeNav()
                      void signOutAndRedirectToHome()
                    }}
                  >
                    Sign Out
                  </NavLink>
                </NavDropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </ProfileBox>
        ) : (
          <LoginBox className={`align-self-center justify-content-end`}>
            <SignInWithButton />
          </LoginBox>
        )}

        {/* <NavBarBox className={`align-self-center justify-content-end`}>
            <ProfileLink role={claims?.role} fullName={profile?.fullName} />
          </NavBarBox> */}
        {/* </NavBarBoxContainer> */}
      </Container>
      {/* </Navbar> */}
    </>
  )
}

// rework spacing amoung elements in dropbox (primarily right to left spacing)
// replace profile icon with white border/blue person?
