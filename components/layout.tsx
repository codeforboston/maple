import Head from "next/head"
import { useTranslation } from "next-i18next"
import { useEffect, useState } from "react"
import Image from "react-bootstrap/Image"
import { useMediaQuery } from "usehooks-ts"
import PageFooter from "./Footer/Footer"
import { NavLink } from "./Navlink"
import ProfileLink from "./ProfileLink/ProfileLink"
import { SignInWithButton, signOutAndRedirectToHome, useAuth } from "./auth"
import AuthModal from "./auth/AuthModal"
import { Container, Nav, NavDropdown, Navbar } from "./bootstrap"
import { useProfile } from "./db"
import styles from "./layout.module.css"

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
      <div className={styles.pageContainer}>
        <TopNav />
        <AuthModal />
        <div className={styles.content}>{children}</div>
        <PageFooter
          authenticated={authenticated}
          user={user as any}
          signOut={signOutAndRedirectToHome}
        />
      </div>
    </>
  )
}

const TopNav: React.FC<React.PropsWithChildren<unknown>> = () => {
  const { authenticated, claims } = useAuth()
  const { profile } = useProfile()
  const isMobile = useMediaQuery("(max-width: 768px)")
  const [sticky, setSticky] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const { t } = useTranslation(["common", "auth"])

  const toggleNav = () => setIsExpanded(!isExpanded)
  const closeNav = () => setIsExpanded(false)

  useEffect(() => setSticky(isMobile), [isMobile])

  return (
    <Navbar
      bg="secondary"
      variant="dark"
      sticky={sticky ? "top" : undefined}
      expand={false}
      expanded={isExpanded}
      data-bs-theme="dark"
    >
      <Container fluid>
        <div className={styles.navbar_boxes_container}>
          <div className={styles.navbar_box}>
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
                        href="/learn/basics-of-testimony"
                        handleClick={closeNav}
                      >
                        {t("navigation.learnAboutTestimony")}
                      </NavLink>
                    </NavDropdown.Item>
                    <NavDropdown.Item>
                      <NavLink
                        href="/learn/communicating-with-legislators"
                        handleClick={closeNav}
                      >
                        {t("navigation.communicatingWithLegislators")}
                      </NavLink>
                    </NavDropdown.Item>
                    <NavDropdown.Item>
                      <NavLink
                        href="/learn/additional-resources"
                        handleClick={closeNav}
                      >
                        {t("navigation.additionalResources")}
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
          </div>
          <div className={sticky ? "me-2 w-100 h-100 flex" : styles.navbar_box}>
            <div className={sticky ? styles.center_menu : ""}>
              <Nav.Link href="/" className="py-0 px-2 w-100">
                {sticky ? (
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
          <div className={styles.navbar_box}>
            <ProfileLink
              role={claims?.role}
              fullName={profile?.fullName}
              sticky={sticky}
            />
          </div>
        </div>
      </Container>

      {sticky && !authenticated ? (
        <SignInWithButton className={styles.mobile_nav_auth} />
      ) : null}
    </Navbar>
  )
}
