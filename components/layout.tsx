import Head from "next/head"
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
            <Navbar expand={false}>
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
                    Home
                  </NavLink>
                  <NavLink
                    className={"navLink-primary"}
                    href="/bills"
                    handleClick={closeNav}
                  >
                    Browse Bills
                  </NavLink>
                  <NavLink
                    className={"navLink-primary"}
                    href="/testimony"
                    handleClick={closeNav}
                  >
                    Browse Testimony
                  </NavLink>

                  <NavDropdown className={"navLink-primary"} title={"Learn"}>
                    <NavDropdown.Item>
                      <NavLink
                        href="/learn/basics-of-testimony"
                        handleClick={closeNav}
                      >
                        Learn About Testimony
                      </NavLink>
                    </NavDropdown.Item>
                    <NavDropdown.Item>
                      <NavLink
                        href="/learn/communicating-with-legislators"
                        handleClick={closeNav}
                      >
                        Communicating with Legislators
                      </NavLink>
                    </NavDropdown.Item>
                    <NavDropdown.Item>
                      <NavLink
                        href="/learn/additional-resources"
                        handleClick={closeNav}
                      >
                        Additional Resources
                      </NavLink>
                    </NavDropdown.Item>
                  </NavDropdown>

                  <NavDropdown className={"navLink-primary"} title={"About"}>
                    <NavDropdown.Item>
                      <NavLink
                        href="/about/mission-and-goals"
                        handleClick={closeNav}
                      >
                        Our Mission &amp; Goals
                      </NavLink>
                    </NavDropdown.Item>
                    <NavDropdown.Item>
                      <NavLink href="/about/our-team" handleClick={closeNav}>
                        Our Team
                      </NavLink>
                    </NavDropdown.Item>
                    <NavDropdown.Item>
                      <NavLink
                        href="/about/support-maple"
                        handleClick={closeNav}
                      >
                        How to Support MAPLE
                      </NavLink>
                    </NavDropdown.Item>
                    <NavDropdown.Item>
                      <NavLink href="/policies" handleClick={closeNav}>
                        Privacy Policy & Code of Conduct
                      </NavLink>
                    </NavDropdown.Item>
                  </NavDropdown>

                  <NavDropdown
                    className={"navLink-primary"}
                    title={"Why Use MAPLE"}
                  >
                    <NavDropdown.Item>
                      <NavLink
                        href="/why-use-maple/for-individuals"
                        handleClick={closeNav}
                      >
                        For Individuals
                      </NavLink>
                    </NavDropdown.Item>
                    <NavDropdown.Item>
                      <NavLink
                        href="/why-use-maple/for-orgs"
                        handleClick={closeNav}
                      >
                        For Organizations
                      </NavLink>
                    </NavDropdown.Item>
                    <NavDropdown.Item>
                      <NavLink
                        href="/why-use-maple/for-legislators"
                        handleClick={closeNav}
                      >
                        For Legislators
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
                      Sign Out
                    </NavLink>
                  )}
                </Nav>
              </Navbar.Collapse>
            </Navbar>
          </div>
          <div className={styles.navbar_box}>
            <Navbar.Brand className="mx-2 p-0">
              <Nav className="me-auto">
                <Nav.Link href="/" className="p-0">
                  <Image fluid src="/nav-logo.svg" alt="logo"></Image>
                </Nav.Link>
              </Nav>
            </Navbar.Brand>
          </div>
          <div className={styles.navbar_box}>
            <ProfileLink
              role={claims?.role}
              fullName={profile?.fullName}
              sticky
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
