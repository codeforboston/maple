import { useTranslation } from "next-i18next"
import React, { FC, useState } from "react"
import Image from "react-bootstrap/Image"
import { SignInWithButton, signOutAndRedirectToHome, useAuth } from "./auth"
import { Container, Nav, Navbar, NavDropdown } from "./bootstrap"
import { useProfile } from "./db"
import { NavLink } from "./Navlink"

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

export const MobileNav: React.FC<React.PropsWithChildren<unknown>> = () => {
  const { authenticated, user } = useAuth()
  const [isExpanded, setIsExpanded] = useState(false)
  const { t } = useTranslation(["common", "auth"])

  const toggleNav = () => setIsExpanded(!isExpanded)
  const closeNav = () => setIsExpanded(false)

  const userLink = "/profile?id=" + user?.uid

  const result = useProfile()
  let isOrg = result?.profile?.role === "organization"

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
          <NavBarBox>
            <Navbar expand={false} expanded={isExpanded}>
              <Navbar.Brand>
                <Navbar.Toggle aria-controls="topnav" onClick={toggleNav} />
              </Navbar.Brand>
              <Navbar.Collapse id="topnav">
                <Nav className="me-auto">
                  <NavLink
                    className={"navLink-primary"}
                    href="/"
                    handleClick={closeNav}
                  >
                    {t("navigation.home")}
                  </NavLink>
                  <NavLink
                    className={"navLink-primary"}
                    href="/bills"
                    handleClick={closeNav}
                  >
                    {t("navigation.browseBills")}
                  </NavLink>
                  <NavLink
                    className={"navLink-primary"}
                    href="/testimony"
                    handleClick={closeNav}
                  >
                    {t("navigation.browseTestimony")}
                  </NavLink>

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
                  </NavDropdown>

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
                      <NavLink
                        href="/about/support-maple"
                        handleClick={closeNav}
                      >
                        {t("navigation.supportMaple")}
                      </NavLink>
                    </NavDropdown.Item>
                    <NavDropdown.Item>
                      <NavLink href="/policies" handleClick={closeNav}>
                        {t("navigation.privacyAndConduct")}
                      </NavLink>
                    </NavDropdown.Item>
                  </NavDropdown>

                  <NavDropdown
                    className={"navLink-primary"}
                    title={t("whyUseMaple")}
                  >
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

                  {authenticated && (
                    <NavLink
                      className={"navLink-primary"}
                      handleClick={() => {
                        closeNav()
                        void signOutAndRedirectToHome()
                      }}
                    >
                      {t("signOut", { ns: "auth" })}
                    </NavLink>
                  )}
                </Nav>
              </Navbar.Collapse>
            </Navbar>
          </NavBarBox>

          <div>
            <Nav.Link href="/">
              <Image
                src="/Logo2024.png"
                alt="logo"
                className="w-100"
                width="60"
                height="60"
              />
            </Nav.Link>
          </div>

          <NavBarBox className={`justify-content-end`}>
            <Navbar
              expand={false}
              expanded={isExpanded}
              variant="dark"
              bg="secondary"
              collapseOnSelect={true}
              className="d-flex justify-content-end"
            >
              {authenticated ? (
                <>
                  <Navbar.Brand onClick={toggleNav}>
                    <Nav.Link className="p-0 text-white">
                      {isOrg ? (
                        <Image
                          src="/profile-org-white.svg"
                          alt="profile icon"
                          width="35"
                          height="35"
                        />
                      ) : (
                        <Image
                          src="/profile-individual-white.svg"
                          alt="profile icon"
                          width="35"
                          height="35"
                        />
                      )}
                    </Nav.Link>
                  </Navbar.Brand>
                  <Navbar.Collapse id="profile-nav">
                    <Nav className="me-4 d-flex align-items-end">
                      <NavLink
                        className={"navLink-primary"}
                        handleClick={() => {
                          location.assign(userLink)
                        }}
                      >
                        View Profile
                      </NavLink>
                      <NavLink
                        className={"navLink-primary"}
                        href="/editprofile"
                        handleClick={closeNav}
                      >
                        Edit Profile
                      </NavLink>
                      <NavLink
                        className={"navLink-primary"}
                        handleClick={() => {
                          closeNav()
                          void signOutAndRedirectToHome()
                        }}
                      >
                        Sign Out
                      </NavLink>
                    </Nav>
                  </Navbar.Collapse>
                </>
              ) : (
                <></>
              )}
            </Navbar>
          </NavBarBox>
        </NavBarBoxContainer>
      </Container>

      {!authenticated ? <SignInWithButton className={`w-100`} /> : null}
    </Navbar>
  )
}
