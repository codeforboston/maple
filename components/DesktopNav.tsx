import { useTranslation } from "next-i18next"
import Head from "next/head"
import React, { FC, useEffect, useState } from "react"
import Image from "react-bootstrap/Image"
import { useMediaQuery } from "usehooks-ts"
import { SignInWithButton, signOutAndRedirectToHome, useAuth } from "./auth"
import AuthModal from "./auth/AuthModal"
import { Container, Nav, NavDropdown, Navbar } from "./bootstrap"
import { useProfile } from "./db"
import PageFooter from "./Footer/Footer"
import { NavBarBox, NavBarBoxContainer } from "./layout"
import { NavLink } from "./Navlink"
import ProfileLink from "./ProfileLink"

export const DesktopNav: React.FC<React.PropsWithChildren<unknown>> = () => {
  const { authenticated, claims } = useAuth()
  const { profile } = useProfile()
  const [isExpanded, setIsExpanded] = useState(false)
  const { t } = useTranslation(["common", "auth"])

  const toggleNav = () => setIsExpanded(!isExpanded)
  const closeNav = () => setIsExpanded(false)

  return (
    <Navbar
      bg="secondary"
      variant="dark"
      sticky="top"
      expand={false}
      expanded={isExpanded}
      data-bs-theme="dark"
    >
      <Container fluid>
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
                className={"navLink-primary"}
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
                className={"navLink-primary"}
                href="/testimony"
                handleClick={closeNav}
              >
                {t("navigation.browseTestimony")}
              </NavLink>
            </Nav>
          </NavBarBox>

          <NavBarBox className="align-self-center">
            <Nav className="mx-auto">
              <NavDropdown className={"navLink-primary"} title={t("about")}>
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
              </NavDropdown>
            </Nav>
          </NavBarBox>

          <NavBarBox className="align-self-center">
            <Nav className="mx-auto">
              <NavDropdown className={"navLink-primary"} title={t("learn")}>
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
              </NavDropdown>
            </Nav>
          </NavBarBox>

          <NavBarBox className={`align-self-center justify-content-end`}>
            <ProfileLink role={claims?.role} fullName={profile?.fullName} />
          </NavBarBox>
        </NavBarBoxContainer>
      </Container>
    </Navbar>
  )
}
