import { useEffect, useState } from "react"
import { Container, Navbar, Nav } from "react-bootstrap"
import Image from "react-bootstrap/Image"
import { Role, signOutAndRedirectToHome, useAuth } from "../auth"
import { NavLink } from "../Navlink"
import styles from "./ProfileLink.module.css"

const greeting = (role: Role, fullName?: string) => {
  switch (role) {
    case "user":
    case "legislator":
    case "organization":
      return fullName ? `Hello, ${fullName}` : "Hello there"
    case "admin":
      return `Hello, Admin ${fullName}`
  }
}

const ProfileLink = ({
  fullName,
  role = "user"
}: {
  fullName?: string
  role?: Role
}) => {
  const { user } = useAuth()
  const [search, setSearch] = useState("")
  const [sticky, setSticky] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  const toggleNav = () => setIsExpanded(!isExpanded)
  const closeNav = () => setIsExpanded(false)

  useEffect(() => {
    if (user?.uid) {
      setSearch(`?id=${user.uid}`)
    }
  }, [user?.uid])

  return (
    <>
      <Navbar
        bg="secondary"
        variant="dark"
        sticky={sticky ? "top" : undefined}
        expand={false}
        expanded={isExpanded}
        className="p-0"
      >
        <Container className={`py-0`}>
          <div className={styles.navbar_boxes_container}>
            <Navbar.Brand className="mx-2 p-0" onClick={toggleNav}>
              <Nav.Link className="p-0">
                <Image
                  className={styles.profileLinkImage}
                  src="/profile-icon.svg"
                  alt="profile icon"
                ></Image>
                {greeting(role, fullName)}
              </Nav.Link>
            </Navbar.Brand>
          </div>
          <Navbar.Collapse id="topnav">
            <Nav className="me-auto">
              <NavLink
                className={"navLink-primary"}
                href={"/profile" + search}
                handleClick={closeNav}
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
        </Container>
      </Navbar>
    </>
  )
}
export default ProfileLink
