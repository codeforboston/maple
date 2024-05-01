import { useTranslation } from "next-i18next"
import Head from "next/head"
import React, { FC, useEffect, useState } from "react"
import Image from "react-bootstrap/Image"
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
      <Container fluid className={`bg-secondary py-2`}>
        <NavBarBoxContainer>
          <div className={`col justify-content-start align-items-center`}>
            <Nav.Link href="/" className="py-0 px-2 w-100">
              <Image src="/Logo2024.png" alt="logo" width="80" height="80" />
            </Nav.Link>
          </div>

          <div className={`align-self-center col d-flex `}>
            <button className={`bg-light col mx-2 my-2`}>
              <div className={`text-dark`}>Placeholder Search Widget</div>
            </button>
          </div>

          <NavBarBox className="align-self-center">
            <Nav className="mx-auto">
              <NavLink
                className={"navLink-primary text-white-50"}
                href="/bills"
                handleClick={closeNav}
              >
                {t("navigation.browseBills")}
              </NavLink>
            </Nav>
          </NavBarBox>

          <NavBarBox className="align-self-center">
            <Nav className="mx-auto">
              <NavLink
                className={"navLink-primary text-white-50"}
                href="/testimony"
                handleClick={closeNav}
              >
                {t("navigation.browseTestimony")}
              </NavLink>
            </Nav>
          </NavBarBox>

          <NavBarBox className="align-self-center">
            <div className="mx-auto">
              <Dropdown>
                <Dropdown.Toggle className="btn-secondary text-white-50">
                  {t("about")}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <NavDropdown.Item>
                    <NavLink href="/about/faq-page" handleClick={closeNav}>
                      {t("navigation.faq")}
                    </NavLink>
                  </NavDropdown.Item>
                  <NavDropdown.Item>
                    <NavLink
                      href="/about/mission-and-goals"
                      handleClick={closeNav}
                    >
                      {t("navigation.missionAndGoals")}
                    </NavLink>
                  </NavDropdown.Item>
                  <NavDropdown.Item>
                    <NavLink href="/about/our-team" handleClick={closeNav}>
                      {t("team")}
                    </NavLink>
                  </NavDropdown.Item>
                  <NavDropdown.Item>
                    <NavLink href="/about/support-maple" handleClick={closeNav}>
                      {t("navigation.supportMaple")}
                    </NavLink>
                  </NavDropdown.Item>
                  <NavDropdown.Item>
                    <NavLink href="/policies" handleClick={closeNav}>
                      {t("navigation.privacyAndConduct")}
                    </NavLink>
                  </NavDropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </NavBarBox>

          <NavBarBox className="align-self-center">
            <div className="mx-auto">
              <Dropdown>
                <Dropdown.Toggle className="btn-secondary text-white-50">
                  {t("learn")}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <NavDropdown.Item>
                    <NavLink
                      href="/learn/to-write-effective-testimony"
                      handleClick={closeNav}
                    >
                      {t("navigation.toWriteEffectiveTestimony")}
                    </NavLink>
                  </NavDropdown.Item>
                  <NavDropdown.Item>
                    <NavLink
                      href="/learn/legislative-process"
                      handleClick={closeNav}
                    >
                      {t("navigation.legislativeProcess")}
                    </NavLink>
                  </NavDropdown.Item>
                  <NavDropdown.Item>
                    <NavLink
                      href="/why-use-maple/for-individuals"
                      handleClick={closeNav}
                    >
                      {t("navigation.forIndividuals")}
                    </NavLink>
                  </NavDropdown.Item>
                  <NavDropdown.Item>
                    <NavLink
                      href="/why-use-maple/for-orgs"
                      handleClick={closeNav}
                    >
                      {t("navigation.forOrganizations")}
                    </NavLink>
                  </NavDropdown.Item>
                  <NavDropdown.Item>
                    <NavLink
                      href="/why-use-maple/for-legislators"
                      handleClick={closeNav}
                    >
                      {t("navigation.forLegislators")}
                    </NavLink>
                  </NavDropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </NavBarBox>

          <NavBarBox className="align-self-center">
            <div className="mx-auto">
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
            </div>
          </NavBarBox>

          {/* <NavBarBox className={`align-self-center justify-content-end`}>
            <ProfileLink role={claims?.role} fullName={profile?.fullName} />
          </NavBarBox> */}
        </NavBarBoxContainer>
      </Container>
      {/* </Navbar> */}
    </>
  )
}

// rework spacing amoung elements in dropbox (primarily right to left spacing)
// replace profile icon with white border/blue person?
