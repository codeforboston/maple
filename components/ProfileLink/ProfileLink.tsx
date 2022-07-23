import { Container, Nav, Navbar } from "react-bootstrap"
import Image from "react-bootstrap/Image"
import { Role } from "../auth"

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
  return (
    <Container>
      <Nav.Link href="/profile">
        <div style={{ display: "flex", alignItems: "center" }}>
          <Image
            style={{ margin: "10px" }}
            src="profile-icon.svg"
            alt="profile icon"
          ></Image>
          <Navbar expand="lg">
            <Navbar.Collapse id="topnav">
              <Navbar.Brand>{greeting(role, displayName)}</Navbar.Brand>
            </Navbar.Collapse>
          </Navbar>
        </div>
      </Nav.Link>
    </Container>
  )
}
export default ProfileLink
