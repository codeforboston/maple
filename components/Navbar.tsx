import { useTranslation } from "next-i18next"
import React, { FC, useState } from "react"
import Image from "react-bootstrap/Image"
import { useMediaQuery } from "usehooks-ts"
import { SignInWithButton, signOutAndRedirectToHome, useAuth } from "./auth"
import { Col, Container, Dropdown, Nav, Navbar, NavDropdown } from "./bootstrap"
import { useProfile } from "./db"
import { NavLink } from "./Navlink"

import styled from "styled-components"

const LogoBox = styled.div`
  width: max-content;
`

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
      className={`col d-flex justify-content-end align-items-center ${className}`}
    >
      {children}
    </div>
  )
}

export const UnifiedNavbar: React.FC<React.PropsWithChildren<unknown>> = () => {
  const { authenticated, user } = useAuth()
  const [isExpanded, setIsExpanded] = useState(false)
  const { t } = useTranslation(["common", "auth"])

  const isMobile = useMediaQuery("(max-width: 768px)")

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
      <Container fluid className="d-flex">
        <NavBarBoxContainer>
          {isMobile ? (
            <div>
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

                    <NavDropdown
                      className={"navLink-primary"}
                      title={t("learn")}
                    >
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

                    <NavDropdown
                      className={"navLink-primary"}
                      title={t("about")}
                    >
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
            </div>
          ) : (
            <div className={`align-items-center justify-content-start me-3`}>
              <Nav.Link href="/" className={`py-0 px-2`}>
                <Image src="/Logo2024.png" alt="logo" width="80" height="80" />
              </Nav.Link>
            </div>
          )}

          {isMobile ? (
            <div className="justify-content-center">
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
          ) : (
            <NavBarBox>
              <Navbar expand={false} expanded={isExpanded}>
                <Col className={`align-self-center`}>
                  <Nav>
                    <NavLink
                      className={`px-3 text-nowrap text-white-50`}
                      href="/bills"
                    >
                      {t("navigation.browseBills")}
                    </NavLink>
                  </Nav>
                </Col>

                <Col className="align-self-center">
                  <Nav>
                    <NavLink
                      className={"px-3 text-nowrap text-white-50"}
                      href="/testimony"
                    >
                      {t("navigation.browseTestimony")}
                    </NavLink>
                  </Nav>
                </Col>

                <Col className={`align-self-center`}>
                  <Dropdown>
                    <Dropdown.Toggle className={`btn-secondary text-white-50`}>
                      {t("about")}
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <NavDropdown.Item>
                        <NavLink href="/about/mission-and-goals">
                          {t("navigation.missionAndGoals")}
                        </NavLink>
                      </NavDropdown.Item>
                      <NavDropdown.Item>
                        <NavLink href="/about/our-team">
                          {t("navigation.team")}
                        </NavLink>
                      </NavDropdown.Item>
                      <NavDropdown.Item>
                        <NavLink href="/about/support-maple">
                          {t("navigation.supportMaple")}
                        </NavLink>
                      </NavDropdown.Item>

                      {/* delete this after the link is relocated to the Footer */}

                      {/* <NavDropdown.Item>
                              <NavLink href="/policies">
                                {t("navigation.privacyAndConduct")}
                              </NavLink>
                            </NavDropdown.Item> */}
                      <NavDropdown.Item>
                        <NavLink href="/about/faq-page">
                          {t("navigation.faq")}
                        </NavLink>
                      </NavDropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </Col>

                <Col className={`align-self-center justify-content-end`}>
                  <Dropdown>
                    <Dropdown.Toggle className={`btn-secondary text-white-50`}>
                      {t("learn")}
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <NavDropdown.Item>
                        <NavLink href="/learn/to-write-effective-testimony">
                          {t("navigation.toWriteEffectiveTestimony")}
                        </NavLink>
                      </NavDropdown.Item>
                      <NavDropdown.Item>
                        <NavLink href="/learn/legislative-process">
                          {t("navigation.legislativeProcess")}
                        </NavLink>
                      </NavDropdown.Item>

                      {/* These 3 `Why Use...` links will be comboed into one link when their corresponding page is refactored */}

                      <NavDropdown.Item>
                        <NavLink href="/why-use-maple/for-individuals">
                          {t("navigation.forIndividuals")}
                        </NavLink>
                      </NavDropdown.Item>
                      <NavDropdown.Item>
                        <NavLink href="/why-use-maple/for-orgs">
                          {t("navigation.forOrganizations")}
                        </NavLink>
                      </NavDropdown.Item>
                      <NavDropdown.Item>
                        <NavLink href="/why-use-maple/for-legislators">
                          {t("navigation.forLegislators")}
                        </NavLink>
                      </NavDropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </Col>
              </Navbar>
            </NavBarBox>
          )}

          <LogoBox>
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
                  {isMobile ? (
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
                    <div className={`align-self-center justify-content-end`}>
                      <Dropdown>
                        <Dropdown.Toggle className={`btn-secondary`}>
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
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                          <NavDropdown.Item>
                            <NavLink
                              handleClick={() => {
                                location.assign(userLink)
                              }}
                            >
                              View Profile
                            </NavLink>
                          </NavDropdown.Item>
                          <NavDropdown.Item>
                            <NavLink href="/editprofile">Edit Profile</NavLink>
                          </NavDropdown.Item>
                          <NavDropdown.Item>
                            <NavLink
                              handleClick={() => {
                                void signOutAndRedirectToHome()
                              }}
                            >
                              Sign Out
                            </NavLink>
                          </NavDropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </div>
                  )}
                </>
              ) : (
                <div className={`align-self-center justify-content-end`}>
                  <SignInWithButton />
                </div>
              )}
            </Navbar>
          </LogoBox>
        </NavBarBoxContainer>
      </Container>

      {/* {!authenticated ? <SignInWithButton className={`w-100`} /> : null} */}
    </Navbar>
  )
}
