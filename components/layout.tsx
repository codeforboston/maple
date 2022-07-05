import Head from "next/head"
import { useState } from "react"
import Image from "react-bootstrap/Image"
import { SignInWithModal, useAuth } from "./auth"
import { Container, Nav, Navbar } from "./bootstrap"
import { auth } from "./firebase"
import PageFooter from "./Footer/Footer"
import { NavLink } from "./Navlink"
import ProfileLink from "./ProfileLink/ProfileLink"
export type LayoutProps = {
  title?: string
}

export const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  const { authenticated } = useAuth()

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
        signOut={() => void auth.signOut()}
      />
    </>
  )
}

const TopNav: React.FC = () => {
  const { authenticated, user, claims } = useAuth()
  const [isExpanded, setIsExpanded] = useState(false)

  const handleClick = () => {
    setIsExpanded(false)
    console.log("Clicked")
  }

  return (
    <>
      <Navbar
        bg="secondary"
        variant="dark"
        expand={false}
        expanded={isExpanded}
      >
        <Container>
          <Navbar.Toggle
            aria-controls="topnav"
            onClick={() => setIsExpanded(isExpanded ? false : true)}
          />
          <Navbar.Brand>
            <Nav.Link href="/">
              <Image fluid src="nav-logo.png" alt="logo"></Image>
            </Nav.Link>
          </Navbar.Brand>
          <Nav>
            {!authenticated ? (
              <SignInWithModal />
            ) : (
              <ProfileLink
                role={claims?.role}
                displayName={user?.displayName ?? undefined}
              ></ProfileLink>
            )}
          </Nav>
          <Navbar.Collapse id="topnav">
            <Nav className="me-auto">
              <NavLink href="/" handleClick={handleClick}>
                Home
              </NavLink>
              <NavLink href="/bills" handleClick={handleClick}>
                Bills
              </NavLink>
              <NavLink href="/testimonies" handleClick={handleClick}>
                Testimony
              </NavLink>

              <Navbar.Text className="navbar-section-header">Learn</Navbar.Text>
              <Container
                style={{ alignContent: "flex-end" }}
                onClick={handleClick}
              >
                <NavLink href="/writingeffectivetestimonies">
                  Writing Effective Testimonies
                </NavLink>
                <NavLink href="/legprocess">
                  Communicating with Legislators
                </NavLink>
                <NavLink href="/learnroleoftestimony">
                  Role Of Testimony
                </NavLink>
                <NavLink href="/additionalresources">
                  Additional Resources
                </NavLink>
              </Container>

              <Navbar.Text className="navbar-section-header">About</Navbar.Text>
              <Container
                style={{ alignContent: "flex-end" }}
                onClick={handleClick}
              >
                <NavLink href="/missionandgoals">
                  Our Mission &amp; Goals
                </NavLink>
                <NavLink href="/ourteam">Our Team</NavLink>
              </Container>

              {authenticated && (
                <NavLink href="" handleClick={() => auth.signOut()}>
                  Sign Out
                </NavLink>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  )
}
