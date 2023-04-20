import { useEffect, useState } from "react"
import { Container, Navbar, Nav } from "react-bootstrap"
import Image from "react-bootstrap/Image"
import { Role, signOutAndRedirectToHome, useAuth } from "../auth"
import { NavLink } from "../Navlink"
import styles from "./ProfileLink.module.css"

const greeting = (role: Role, displayName?: string) => {
  switch (role) {
    case "user":
    case "legislator":
    case "organization":
      return displayName ? `Hello, ${displayName}` : "Hello there"
    case "admin":
      return `Hello, Admin ${displayName}`
  }
}

const ProfileLink = ({
  displayName,
  role = "user"
}: {
  displayName?: string
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
                {greeting(role, displayName)}
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
          {/* <NavLink href={"/profile" + search} className="py-0">
            <div style={{ display: "flex", alignItems: "center", padding: 0 }}>
              <Image
                className={styles.profileLinkImage}
                src="/profile-icon.svg"
                alt="profile icon"
              />
              <Navbar expand="lg" className="p-0">
                <Navbar.Collapse id="topnav">
                  <Navbar.Brand>{greeting(role, displayName)}</Navbar.Brand>
                </Navbar.Collapse>
              </Navbar>
            </div>
          </NavLink> */}
        </Container>
      </Navbar>
    </>
  )
}
export default ProfileLink
