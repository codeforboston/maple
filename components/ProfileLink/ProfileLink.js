import { useEffect, useState } from "react"
import { Container, Nav, Navbar } from "react-bootstrap"
import Image from "react-bootstrap/Image"
import { useAuth } from "../auth"
import { NavLink } from "../Navlink"
const ProfileLink = ({ displayName = "User" }) => {
  const { user } = useAuth()
  const [search, setSearch] = useState()

  useEffect(() => {
    if (user?.uid) {
      setSearch(`?id=${user.uid}`)
    }
  }, [user?.uid])

  return (
    <Container>
      <NavLink href={"/profile" + search}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <Image
            style={{ margin: "10px" }}
            src="profile-icon.svg"
            alt="profile icon"
          ></Image>
          <Navbar expand="lg">
            <Navbar.Collapse id="topnav">
              <Navbar.Brand>Hello, {displayName}</Navbar.Brand>
            </Navbar.Collapse>
          </Navbar>
        </div>
      </NavLink>
    </Container>
  )
}
export default ProfileLink
