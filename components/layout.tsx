import Head from "next/head"
import { useEffect, useState } from "react"
import Image from "react-bootstrap/Image"
import { useMediaQuery } from "usehooks-ts"
import { SignInWithButton, signOutAndRedirectToHome, useAuth } from "./auth"
import AuthModal from "./auth/AuthModal"
import { Container, Nav, Navbar } from "./bootstrap"
import { useProfile } from "./db"
import PageFooter from "./Footer/Footer"
import styles from "./layout.module.css"
import { NavLink } from "./Navlink"
import ProfileLink from "./ProfileLink/ProfileLink"

export type LayoutProps = {
  title?: string
}

export const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  const { authenticated, user } = useAuth()

  return (
    <>
      <Head>
        <title>{`${
          title ? title + " | " : ""
        }MAPLE: The Massachusetts Platform for Legislative Engagement`}</title>
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

const TopNav: React.FC = () => {
  const { authenticated, claims } = useAuth()
  const { profile } = useProfile()
  const isMobile = useMediaQuery("(max-width: 768px)")
  const [sticky, setSticky] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  const toggleNav = () => setIsExpanded(!isExpanded)
  const closeNav = () => setIsExpanded(false)

  useEffect(() => setSticky(isMobile), [isMobile])

  return (
    <>
      <Navbar
        bg="secondary"
        variant="dark"
        sticky={sticky ? "top" : undefined}
        expand={false}
        expanded={isExpanded}
      >
        <Container>
          <div className={styles.navbar_boxes_container}>
            <div className={styles.navbar_box}>
              <Navbar.Toggle aria-controls="topnav" onClick={toggleNav} />
            </div>

            <Navbar.Brand className="mx-2 p-0">
              <Nav.Link href="/" className="p-0">
                <Image fluid src="/nav-logo.svg" alt="logo"></Image>
              </Nav.Link>
            </Navbar.Brand>

            <div className={styles.navbar_box}>
              <Nav>
                {authenticated ? (
                  <ProfileLink
                    role={claims?.role}
                    displayName={profile?.displayName}
                  />
                ) : (
                  !sticky && <SignInWithButton />
                )}
              </Nav>
            </div>
          </div>
          <Navbar.Collapse id="topnav">
            <Nav className="me-auto">
              <NavLink href="/" handleClick={closeNav}>
                Home
              </NavLink>
              <NavLink href="/bills" handleClick={closeNav}>
                Bills
              </NavLink>
              {/* <NavLink href="/testimonies" handleClick={closeNav}>
                Testimony
              </NavLink> */}

              <Navbar.Text className="navbar-section-header">Learn</Navbar.Text>
              <Container
                style={{ alignContent: "flex-end" }}
                onClick={closeNav}
              >
                <NavLink href="/learn/basics-of-testimony">
                  Learn About Testimony
                </NavLink>
                <NavLink href="/learn/communicating-with-legislators">
                  Communicating with Legislators
                </NavLink>
                <NavLink href="/learn/additional-resources">
                  Additional Resources
                </NavLink>
              </Container>

              <Navbar.Text className="navbar-section-header">About</Navbar.Text>
              <Container
                style={{ alignContent: "flex-end" }}
                onClick={closeNav}
              >
                <NavLink href="/about/mission-and-goals">
                  Our Mission &amp; Goals
                </NavLink>
                <NavLink href="/about/our-team">Our Team</NavLink>
                <NavLink href="/about/for-testifiers">For Testifiers</NavLink>
                <NavLink href="/about/for-orgs">For Organizations</NavLink>
                <NavLink href="/about/for-legislators">For Legislators</NavLink>
              </Container>

              {authenticated && (
                <NavLink
                  handleClick={() => {
                    closeNav()
                    void signOutAndRedirectToHome()
                  }}
                >
                  Sign Out
                </NavLink>
              )}
            </Nav>
          </Navbar.Collapse>
          {sticky && !authenticated ? (
            <SignInWithButton className={styles.mobile_nav_auth} />
          ) : null}
        </Container>
      </Navbar>
    </>
  )
}
