import { useRouter } from "next/router"
import React from "react"
import { SignInWithModal, SignOut, useAuth } from "./auth"
import { Container, Nav, Navbar } from "./bootstrap"
import { Wrap } from "./links"
import Head from "next/head"
import Image from "react-bootstrap/Image"
import ProfileLink from "./ProfileLink/ProfileLink"
import { auth } from "./firebase"

const V2Layout: React.FC<{ title?: string }> = ({ children, title }) => {
  return (
    <>
      <Head>
        <title>{`${
          title ? title + " | " : ""
        }Massachusetts Platform for Legislative Engagement`}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <TopNav />
      {/*
      Is there a more direct we can remove the white space after the leaf components than 
      adding the overflow: hidden property to this div?
      */}
      <div style={{ overflow: "hidden" }}>{children}</div>
    </>
  )
}

const TopNav: React.FC = () => {
  const { authenticated } = useAuth()
  const displayName = useAuth().user?.displayName
  return (
    <>
      <Navbar bg="secondary" variant="dark" expand={false}>
        <Container>
          <Navbar.Toggle aria-controls="topnav" />
          <Navbar.Brand>
            <Nav.Link href="/">
              <Image fluid src="nav-logo.png" alt="logo"></Image>
            </Nav.Link>
          </Navbar.Brand>
          <Nav>
            {!authenticated ? (
              <SignInWithModal />
            ) : (
              <ProfileLink displayName={displayName}></ProfileLink>
            )}
          </Nav>
          <Navbar.Collapse id="topnav">
            <Nav className="me-auto">
              <NavLink href="/">Home</NavLink>
              <NavLink href="/bills">Bills</NavLink>
              <NavLink href="/testimonies">Testimony</NavLink>
              <NavLink href="/about">About</NavLink>
              <NavLink href="/legprocess">Learn</NavLink>
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

const NavLink: React.FC<{ href: string }> = ({ href, children }) => {
  const router = useRouter()
  return (
    <Wrap href={href}>
      <Nav.Link active={router.pathname === href}>{children}</Nav.Link>
    </Wrap>
  )
}

export default V2Layout
