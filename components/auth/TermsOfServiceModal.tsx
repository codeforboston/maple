import { ChildProcess } from "child_process"
import type { ModalProps } from "react-bootstrap"
import { Alert, Col, Form, Modal, Row, Stack } from "../bootstrap"
import styles from "./TermsOfService.module.css"

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
                <Row className="align-items-end">
                    <Col md={9}>
                        <h4>Privacy Policy</h4>
                    </Col>
                    <Col md={3}>
                        <h6 className={styles.readmore}>Read More</h6>
                    </Col>
                    <hr className={styles.hr} />
                    <Col md={10}>
                        <ul>
                            <li>We hvae established this Privacy Policy so you can understand the care with which we intend ot treat your personal information.</li>
                            <li>We store your name, email address, state representative, senator, and password</li>
                            <li>Everything you share with us, other than your email and password, will be available on our website, MAPLE</li>
                        </ul>
                    </Col>
                </Row>
                <Row className="align-items-end">
                    <Col md={9}>
                        <h4>Terms of Service</h4>
                    </Col>
                    <Col md={3}>
                        <h6 className={styles.readmore} >Read More</h6>
                    </Col>
                    <hr className={styles.hr} />
                    <Col md={10}>
                        <ul>
                            <li>You understand that by submitting your testimony to MAPLE you are making it available to MAPLE under an express license that allows reproduction</li>
                            <li>We may send newsletters via email to MAPLE members. You can unsubscribe from these newsletters at any time by using the "Unsubscribe" link in the emails themselves. We never share with or sell your email to third party providers</li>
                        </ul>
                    </Col>
                </Row>
            </Stack>

        </Col>
      </Modal.Body>
    </Modal>
  )
}
