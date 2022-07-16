import Head from "next/head"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import Image from "react-bootstrap/Image"
import { SignInWithModal, SignOut, useAuth } from "./auth"
import { Container, Nav, Navbar } from "./bootstrap"
import { useProfile } from "./db"
import { auth } from "./firebase"
import { Wrap } from "./links"
import ProfileLink from "./ProfileLink/ProfileLink"

export type LayoutProps = {
  title?: string
}

export const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  return (
    <>
      <Head>
        <title>{`${
          title ? title + " | " : ""
        }Massachusetts Platform for Legislative Engagement`}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <TopNav />
      {children}
    </>
  )
}

const TopNav: React.FC = () => {
  const { authenticated } = useAuth()
  const { profile } = useProfile()
  const [isExpanded, setIsExpanded] = useState(false)

  const toggleNav = () => setIsExpanded(!isExpanded)
  const closeNav = () => setIsExpanded(false)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      // when a user clicks the sign out button, the navbar is left open.
      // this fixes that
      if (user === null) {
        closeNav()
      }
    })

    return unsubscribe
  }, [])

  return (
    <>
      <Navbar
        bg="secondary"
        variant="dark"
        expand={false}
        expanded={isExpanded}
      >
        <Container>
          <Navbar.Toggle aria-controls="topnav" onClick={toggleNav} />
          <Navbar.Brand>
            <Nav.Link href="/">
              <Image fluid src="nav-logo.png" alt="logo"></Image>
            </Nav.Link>
          </Navbar.Brand>
          <Nav>
            {!authenticated ? (
              <SignInWithModal />
            ) : (
              <ProfileLink displayName={profile?.displayName} />
            )}
          </Nav>
          <Navbar.Collapse id="topnav">
            <Nav className="me-auto">
              <NavLink href="/" handleClick={closeNav}>
                Home
              </NavLink>
              <NavLink href="/bills" handleClick={closeNav}>
                Bills
              </NavLink>
              <NavLink href="/testimonies" handleClick={closeNav}>
                Testimony
              </NavLink>

              <Navbar.Text className="navbar-section-header">Learn</Navbar.Text>
              <Container
                style={{ alignContent: "flex-end" }}
                onClick={closeNav}
              >
                <NavLink href="/learntestimonies">
                  Writing Effective Testimonies
                </NavLink>
                <NavLink href="/learnroleoftestimony">
                  Role Of Testimony
                </NavLink>
                <NavLink href="/legprocess">Contacting Legislatures</NavLink>
                <NavLink href="#">Additional Resources</NavLink>
              </Container>

              <Navbar.Text className="navbar-section-header">About</Navbar.Text>
              <Container
                style={{ alignContent: "flex-end" }}
                onClick={closeNav}
              >
                <NavLink href="/missionandgoals">
                  Our Mission &amp; Goals
                </NavLink>
                <NavLink href="/ourteam">Our Team</NavLink>
              </Container>

              {authenticated && (
                <div>
                  <SignOut variant="secondary" size="sm" />
                </div>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  )
}

const NavLink: React.FC<{ href: string; handleClick?: any }> = ({
  href,
  handleClick,
  children
}) => {
  const router = useRouter()
  return (
    <Wrap href={href}>
      <Nav.Link active={router.pathname === href} onClick={handleClick}>
        {children}
      </Nav.Link>
    </Wrap>
  )
}
