import { useEffect, useState } from "react"
import { Container, Navbar } from "react-bootstrap"
import Image from "react-bootstrap/Image"
import { Role, useAuth } from "../auth"
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

  useEffect(() => {
    if (user?.uid) {
      setSearch(`?id=${user.uid}`)
    }
  }, [user?.uid])

  return (
    <Container className={`py-0`}>
      <NavLink href={"/profile" + search} className="py-0">
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
      </NavLink>
    </Container>
  )
}
export default ProfileLink
