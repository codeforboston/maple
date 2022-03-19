import Head from "next/head"
import React from "react"
import { SignOut, useAuth } from "./auth"
import { Container, Nav, Navbar, NavDropdown } from "./bootstrap"
import { Wrap } from "./links"

const V2Layout: React.FC<{ title?: string }> = ({ children, title }) => {
  return (
    <>
      <Head>
        <title>{`${
          title ? title + " | " : ""
        }Massachusetts Archive of Transparent Testimony`}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <TopNav />
      <Container className="mt-3">{children}</Container>
    </>
  )
}

const TopNav: React.FC = () => {
  const { authenticated } = useAuth()
  return (
    <Navbar bg="primary" variant="dark" expand="lg">
      <Container>
        <Wrap href="/">
          <Navbar.Brand>
            Massachusetts Archive of Transparent Testimony
          </Navbar.Brand>
        </Wrap>
        <Navbar.Toggle aria-controls="topnav" />
        <Navbar.Collapse id="topnav">
          <Nav className="me-auto">
            <NavLink href="/">Home</NavLink>
            <NavLink href="/bills">Bills</NavLink>
            <NavLink href="/about">About</NavLink>
            <AccountNav authenticated={authenticated} />
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

const AccountNav: React.FC<{ authenticated: boolean }> = ({
  authenticated
}) => {
  return authenticated ? (
    <>
      <NavLink href="/profile">Profile</NavLink>
      <SignOut />
    </>
  ) : (
    <NavLink href="/login">Sign In To Testify</NavLink>
  )
}

const NavLink: React.FC<{ href: string }> = ({ href, children }) => (
  <Wrap href={href}>
    <Nav.Link>{children}</Nav.Link>
  </Wrap>
)

export default V2Layout
