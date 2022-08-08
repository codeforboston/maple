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
    <Container className={`py-0`}>
      <NavLink href={"/profile" + search} className={`py-0`}>
        <div style={{ display: "flex", alignItems: "center", padding: 0 }}>
          <Image
            style={{ margin: "0 10px" }}
            src="profile-icon.svg"
            alt="profile icon"
          ></Image>
          <Navbar expand="lg" className={`p-0`}>
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
