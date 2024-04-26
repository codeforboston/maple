import { useTranslation } from "next-i18next"
import Head from "next/head"
import React, { FC, useEffect, useState } from "react"
import Image from "react-bootstrap/Image"
import { useMediaQuery } from "usehooks-ts"
import PageFooter from "./Footer/Footer"
import { NavLink } from "./Navlink"
import ProfileLink from "./ProfileLink"
import { SignInWithButton, signOutAndRedirectToHome, useAuth } from "./auth"
import AuthModal from "./auth/AuthModal"
import { Container, Nav, NavDropdown, Navbar } from "./bootstrap"
import { useProfile } from "./db"

export type LayoutProps = {
  title?: string
}

export const Layout: React.FC<React.PropsWithChildren<LayoutProps>> = ({
  children,
  title
}) => {
  const { authenticated, user } = useAuth()
  const { t } = useTranslation("common")
  const formattedTitle = title
    ? `${title} | ${t("maple_abbr")}: ${t("maple_fullName")}`
    : `${t("maple_abbr")}: ${t("maple_fullName")}`

  return (
    <>
      <Head>
        <title>{formattedTitle}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <PageContainer>
        <TopNav />
        <AuthModal />
        <div className={`col`}>{children}</div>
        <PageFooter
          authenticated={authenticated}
          user={user as any}
          signOut={signOutAndRedirectToHome}
        />
      </PageContainer>
    </>
  )
}

export const PageContainer: FC<React.PropsWithChildren<unknown>> = ({
  children
}) => {
  return <div className={`vh-100 d-flex flex-column`}>{children}</div>
}

const NavBarBoxContainer: FC<
  React.PropsWithChildren<{ className?: string }>
> = ({ children, className }) => {
  return (
    <div
      className={`d-flex flex-row, align-items-start justify-content-between w-100`}
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

const TopNav: React.FC<React.PropsWithChildren<unknown>> = () => {
  const { authenticated, claims } = useAuth()
  const { profile } = useProfile()
  const isMobile = useMediaQuery("(max-width: 768px)")
  // const [sticky, setSticky] = useState(false)
  const [sticky, setSticky] = useState("top")
  const [isExpanded, setIsExpanded] = useState(false)
  const { t } = useTranslation(["common", "auth"])

  const toggleNav = () => setIsExpanded(!isExpanded)
  const closeNav = () => setIsExpanded(false)

  // useEffect(() => setSticky(isMobile), [isMobile])

  return (
    <Navbar
      bg="secondary"
      variant="dark"
      // sticky={sticky ? "top" : undefined}
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
          <div
            className={
              // sticky
              isMobile
                ? "me-2 w-100 h-100 flex"
                : `col d-flex justify-content-start align-items-center`
            }
          >
            <div
              className={
                // sticky
                isMobile
                  ? `position-absolute top-0 start-50 z-1 translate-middle-x`
                  : ""
              }
            >
              <Nav.Link href="/" className="py-0 px-2 w-100">
                {/* {sticky ? ( */}
                {isMobile ? (
                  <Image
                    src="/white-tree.svg"
                    alt="logo"
                    className="w-100"
                  ></Image>
                ) : (
                  <Image src="/nav-logo.svg" alt="logo"></Image>
                )}
              </Nav.Link>
            </div>
          </div>
          <NavBarBox className={`justify-content-end`}>
            <ProfileLink
              role={claims?.role}
              fullName={profile?.fullName}
              // sticky={sticky}
              isMobile={isMobile}
            />
          </NavBarBox>
        </NavBarBoxContainer>
      </Container>

      {/* {sticky && !authenticated ? ( */}
      {isMobile && !authenticated ? (
        <SignInWithButton className={`w-100`} />
      ) : null}
    </Navbar>
  )
}
