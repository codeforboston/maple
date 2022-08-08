import Head from "next/head"
import { useEffect, useState } from "react"
import Image from "react-bootstrap/Image"
import { SignInWithModal, useAuth } from "./auth"
import { Container, Nav, Navbar } from "./bootstrap"
import { useProfile } from "./db"
import { auth } from "./firebase"
import PageFooter from "./Footer/Footer"
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
        }Massachusetts Platform for Legislative Engagement`}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <TopNav />
      {children}
      <PageFooter
        authenticated={authenticated}
        user={user}
        signOut={() => void auth.signOut()}
      />
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
            <Nav.Link href="/" className={`py-0`}>
              <Image fluid src="nav-logo.png" alt="logo" ></Image>
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
                <NavLink href="/learnbasicsoftestimony">
                  Learn About Testimony
                </NavLink>
                <NavLink href="/legprocess">
                  Communicating with Legislators
                </NavLink>
                <NavLink href="/additionalresources">
                  Additional Resources
                </NavLink>
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
                <NavLink handleClick={() => auth.signOut()}>Sign Out</NavLink>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  )
}
