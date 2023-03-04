import type { ModalProps } from "react-bootstrap"
import { Button, Col, Modal, Row, Stack } from "../bootstrap"
import styles from "./TermsOfService.module.css"
import SVG from "react-inlinesvg"
import { External } from "components/links"

export default function TermsOfServiceModal({
  show,
  onHide,
  onAgree
}: Pick<ModalProps, "show" | "onHide" | "onAgree">) {
  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title id="tos-modal">Privacy Policy & Terms</Modal.Title>
      </Modal.Header>
      <Modal.Body className={styles.text}>
        <Col md={12} className="mx-auto">
          <Stack gap={3} className="mb-4">
            <Row className="align-items-center">
              <Col md={9}>
                <h4>Privacy Policy</h4>
              </Col>
              <Col md={3}>
                <External className={styles.link} href="/policies">
                  Read More
                </External>
              </Col>
              <hr className={styles.hr} />
              <Col md={10}>
                <ul>
                  <li>
                    We have established this Privacy Policy so you can
                    understand the care with which we intend to treat your
                    personal information.
                  </li>
                  <li>
                    We store your name, email address, state representative,
                    senator, and password.
                  </li>
                  <li>
                    Everything you share with us, other than your email and
                    password, will be available on our website, MAPLE.
                  </li>
                </ul>
              </Col>
            </Row>
            <Row className="align-items-center">
              <Col md={9}>
                <h4>Terms of Service</h4>
              </Col>
              <Col md={3}>
                <External className={styles.link} href="/policies">
                  Read More
                </External>
              </Col>

              <hr className={styles.hr} />
              <Col md={10}>
                <ul>
                  <li>
                    You understand that by submitting your testimony to MAPLE
                    you are making it available to MAPLE under an express
                    license that allows reproduction
                  </li>
                  <li>
                    We may send newsletters via email to MAPLE members. You can
                    unsubscribe from these newsletters at any time by using the
                    "Unsubscribe" link in the emails themselves. We never share
                    with or sell your email to third party providers.
                  </li>
                </ul>
              </Col>
            </Row>

            <Col>
              <p className={styles.warning}>
                In order to continue you must agree to the privacy policy and
                terms of use
              </p>
              <Row>
                <Col md={6}>
                  <Button onClick={onAgree} className={styles.button} size="sm">
                    Agree and Sign Up
                  </Button>
                </Col>
                <Col md={6}>
                  <Button
                    onClick={onHide}
                    className={styles.button}
                    size="sm"
                    variant="outline-primary"
                  >
                    Cancel
                  </Button>
                </Col>
              </Row>
            </Col>
          </Stack>
        </Col>
      </Modal.Body>
    </Modal>
  )
}
