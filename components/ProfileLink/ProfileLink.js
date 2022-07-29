import { Container, Nav, Navbar } from "react-bootstrap"
import Image from "react-bootstrap/Image"
import { useAuth } from "../auth"

const ProfileLink = ({ displayName = "User" }) => {
  const { user } = useAuth()

  return (
    <Container>
      <Nav.Link href={`/profile?id=${user.uid}`}>
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
      </Nav.Link>
    </Container>
  )
}
export default ProfileLink
