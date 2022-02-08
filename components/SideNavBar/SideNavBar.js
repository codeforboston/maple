import React from "react"
import styles from "./SideNavBar.module.css"
import { Form, Button, Row, Container } from "react-bootstrap"

const SideNavBar = ({}) => {
  const { authenticated } = useAuth()
  return (
    <Container>
      <div className={styles.sideNavBar}>
        <div className={styles.sideNavBarLogo}>
          <a className={styles.sideNavBarLogoHeader} href="/">
            <div>GGP</div>
            <div className={styles.sideNavBarLogoText}>
              Boston College Clough Center for Constitutional Democracy
            </div>
          </a>
        </div>

        <Form>
          <Form.Group>
            <h2 className="text-center">Find a Bill</h2>
            <Row>
              <Form.Control
                type="text"
                placeholder="Search by bill #"
              ></Form.Control>
            </Row>
            <Row className="mt-2">
              <Button variant="primary">Search</Button>
            </Row>
            <Row className="mt-2">
              <Button variant="secondary">Advanced Search</Button>
            </Row>
            <Row className="mt-4">
              <Button variant="secondary">Sign In</Button>
            </Row>
            <Row className="mt-2">
              <Button variant="secondary">Create a Profile</Button>
            </Row>
          </Form.Group>
        </Form>
      </div>
    </Container>
  )
}

export default SideNavBar
