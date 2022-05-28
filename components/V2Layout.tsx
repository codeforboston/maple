import { useRouter } from "next/router"
import React from "react"
import { SignOut, useAuth } from "./auth"
import { Container, Nav, Navbar } from "./bootstrap"
import { Wrap } from "./links"
import Head from "next/head"
import Image from "react-bootstrap/Image"
import { SignInWithModal } from "./auth"

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
  return (
    <Navbar bg="secondary" variant="dark" expand="xl">
      <Container>
        <Navbar.Toggle aria-controls="topnav" />
        <Navbar.Collapse id="topnav">
          <Nav className="me-auto">
            <NavLink href="/">Home</NavLink>
            <NavLink href="/bills">Bills</NavLink>
            <NavLink href="/testimonies">Testimony</NavLink>
            <NavLink href="/about">About</NavLink>
            <NavLink href="/legprocess">Learn</NavLink>
          </Nav>
        </Navbar.Collapse>
        <Wrap href="/">
          <Navbar.Brand>
            <Image fluid src="nav-logo.png" alt="logo"></Image>
          </Navbar.Brand>
        </Wrap>
        <AccountButton authenticated={authenticated} />
      </Container>
    </Navbar>
  )
}

const AccountButton: React.FC<{ authenticated: boolean }> = ({
  authenticated
}) => {
  return authenticated ? <SignOut /> : <SignInWithModal />
}
// No longer needed
// const AccountNav: React.FC<{ authenticated: boolean }> = ({
//   authenticated
// }) => {
//   return authenticated ? (
//     <></>
//   ) : (
//     <NavLink href="/login">Sign In To Testify</NavLink>
//   )
// }

const NavLink: React.FC<{ href: string }> = ({ href, children }) => {
  const router = useRouter()
  return (
    <Wrap href={href}>
      <Nav.Link active={router.pathname === href}>{children}</Nav.Link>
    </Wrap>
  )
}

export default V2Layout
