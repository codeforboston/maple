import { useEffect, useState } from "react"
import { Container, Navbar, Nav } from "react-bootstrap"
import Image from "react-bootstrap/Image"
import {
  Role,
  SignInWithButton,
  signOutAndRedirectToHome,
  useAuth
} from "../auth"
import { NavLink } from "../Navlink"
import styles from "./ProfileLink.module.css"

const greeting = (role: Role, fullName?: string) => {
  switch (role) {
    case "user":
    case "legislator":
    case "organization":
    case "pendingUpgrade":
      return fullName ? `Hello, ${fullName}` : "Hello there"
    case "admin":
      return `Hello, Admin ${fullName}`
  }
}

const ProfileMenuItem = (
  label: string,
  href: string,
  handleClick: () => void
) => (
  <NavLink className={"navLink-primary"} href={href} handleClick={handleClick}>
    {label}
  </NavLink>
)

type ProfileLinkProps = {
  fullName?: string
  role?: Role
  sticky: boolean
}

const ProfileLink = ({ fullName, role = "user", sticky }: ProfileLinkProps) => {
  const { authenticated, user } = useAuth()

  const [isExpanded, setIsExpanded] = useState(false)
  const toggleNav = () => setIsExpanded(expanded => !expanded)
  const closeNav = () => setIsExpanded(false)
  const userLink = "/profile?id=" + user?.uid

  return (
    <Navbar
      expand={false}
      expanded={isExpanded}
      variant="dark"
      bg="secondary"
      collapseOnSelect={true}
      className="d-flex justify-content-end"
    >
      {authenticated ? (
        <>
          <Navbar.Brand onClick={toggleNav}>
            <Nav.Link className="p-0 text-white">
              <Image
                className={styles.profileLinkImage}
                src="/profile-icon.svg"
                alt="profile icon"
              ></Image>
              {sticky ? "" : greeting(role, fullName)}
            </Nav.Link>
          </Navbar.Brand>
          <Navbar.Collapse id="profile-nav">
            <Nav className="me-4 d-flex align-items-end">
              <NavLink
                className={"navLink-primary"}
                handleClick={() => {
                  location.assign(userLink)
                }}
              >
                View Profile
              </NavLink>
              <NavLink
                className={"navLink-primary"}
                href="/editprofile"
                handleClick={closeNav}
              >
                Edit Profile
              </NavLink>
              <NavLink
                className={"navLink-primary"}
                handleClick={() => {
                  closeNav()
                  void signOutAndRedirectToHome()
                }}
              >
                Sign Out
              </NavLink>
            </Nav>
          </Navbar.Collapse>
        </>
      ) : sticky ? (
        <></>
      ) : (
        <SignInWithButton />
      )}
    </Navbar>
  )
}

export default ProfileLink
