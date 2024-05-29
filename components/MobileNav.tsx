import { useTranslation } from "next-i18next"
import React, { FC, useState } from "react"
import Image from "react-bootstrap/Image"
import { SignInWithButton, signOutAndRedirectToHome, useAuth } from "./auth"
import { Container, Nav, Navbar, NavDropdown } from "./bootstrap"
import { useProfile } from "./db"
import {
  NavbarLinkBills,
  NavbarLinkEffective,
  NavbarLinkFAQ,
  NavbarLinkGoals,
  NavbarLinkLogo,
  NavbarLinkProcess,
  NavbarLinkSupport,
  NavbarLinkTeam,
  NavbarLinkTestimony
} from "./Navbarlinks"
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
                  <NavbarLinkBills handleClick={closeNav} />
                  <NavbarLinkTestimony handleClick={closeNav} />

                  <NavDropdown className={"navLink-primary"} title={t("about")}>
                    <NavbarLinkGoals handleClick={closeNav} />
                    <NavbarLinkTeam handleClick={closeNav} />
                    <NavbarLinkSupport handleClick={closeNav} />
                    <NavbarLinkFAQ handleClick={closeNav} />

                    {/* to be removed when implemented on the footer*/}

                    {/* <NavDropdown.Item>
                        <NavLink href="/policies" handleClick={closeNav}>
                          {t("navigation.privacyAndConduct")}
                        </NavLink>
                      </NavDropdown.Item> */}
                  </NavDropdown>

                  <NavDropdown className={"navLink-primary"} title={t("learn")}>
                    <NavbarLinkEffective handleClick={closeNav} />
                    <NavbarLinkProcess handleClick={closeNav} />
                    <NavDropdown.Item>
                      <NavLink
                        href="/why-use-maple/for-individuals"
                        handleClick={closeNav}
                      >
                        {t("whyUseMaple")}
                      </NavLink>
                    </NavDropdown.Item>
                  </NavDropdown>
                </Nav>
              </Navbar.Collapse>
            </Navbar>
          </NavBarBox>

          <NavbarLinkLogo />

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
