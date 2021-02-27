import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import NavDropdown from "react-bootstrap/NavDropdown";
import styles from "./NavBar.module.css";

function NavBar({ pageTitle = "" }) {
  return (
    <div className={styles.container}>
      <Navbar
        className={styles.navbarCustom}
        bg="dark"
        expand="lg"
        variant="dark"
      >
        <Navbar.Brand href="/">
          Good Governance Project
          <div>Boston College Clough Center for Constitutional Democracy</div>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mr-auto"></Nav>
          <Nav>
            <Nav.Link href="/about">About GGP</Nav.Link>
            {/*<Nav.Link href="/democracy-in-ma">
              Democracy in MA - Overview
            </Nav.Link> */}
            <NavDropdown title="2021 Priorities" id="basic-nav-dropdown">
              <NavDropdown.Item href="/election-day-registration">
                Election Day Registration
              </NavDropdown.Item>
              <NavDropdown.Item href="/campaign-finance">
                Early/Mail Voting
              </NavDropdown.Item>
              <NavDropdown.Item href="/political-advertisements">
                Publicly Financed Campaigns
              </NavDropdown.Item>
              <NavDropdown.Item href="/other-legislative-endorsements">
                Other Legislative Endorsements
              </NavDropdown.Item>
            </NavDropdown>
            <Nav.Link href="/advocacy-maps">Democracy Maps</Nav.Link>
            <Nav.Link href="/contact">Contact Us</Nav.Link>
            {/*<Nav.Link href="/blog">GGP Blog</Nav.Link>*/}
          </Nav>
        </Navbar.Collapse>
      </Navbar>
      <section className={styles.backgroundImg}>{pageTitle}</section>
    </div>
  );
}

export default NavBar;
