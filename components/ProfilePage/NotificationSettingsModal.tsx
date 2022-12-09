import type { ModalProps } from "react-bootstrap"
import { Button, Col, Container, Image, Modal, Row, Stack } from "../bootstrap"
import styles from "./NotificationSettingsModal.module.css"

export default function NotificationSettingsModal({
  show,
  onHide
}: Pick<ModalProps, "show" | "onHide">) {
  return (
    <Modal
      show={show}
      onHide={onHide}
      aria-labelledby="notifications-modal"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="notifications-modal">Settings</Modal.Title>
      </Modal.Header>
      <Modal.Body className={styles.thinContainer}>
        <Row>&nbsp; Notifications</Row>
        <Row>
          <hr />
        </Row>
        <Row>
          <Col className={`col-9 ${styles.NotificationSmallFontSize}`}>
            Would you like to receive updates about bills/organizations you
            follow through email?
          </Col>
          <Col
            className={`col-3 px-0 d-flex justify-content-end align-items-center`}
          >
            <Button
              className={`btn btn-sm btn-outline-secondary py-1 ${styles.NotificationButtonLength}`}
            >
              {"C Enable"}
            </Button>
          </Col>
        </Row>
        <Row className={`pt-5`}>&nbsp; Profile Settings</Row>
        <Row>
          <hr />
        </Row>
        <Row>
          <Col className={`col-9 ${styles.NotificationSmallFontSize}`}>
            Don't make my profile public. (Your name will still be associated
            with your testimony.)
          </Col>
          <Col
            className={`col-3 px-0 d-flex justify-content-end align-items-center`}
          >
            <Button className={`btn btn-sm btn-outline-secondary px-4 py-1`}>
              {"Enable"}
            </Button>
          </Col>
        </Row>
        <Row className={`pt-4`}>
          <Col className={`${styles.NotificationSmallFontSize}`}>&nbsp;</Col>
          <Col className={`d-flex align-items-center justify-content-end px-0`}>
            <Button className={`btn btn-sm mx-3 py-1`}>Continue</Button>
            <Button className={`btn btn-sm btn-outline-secondary py-1`}>
              Cancel
            </Button>
          </Col>
        </Row>
      </Modal.Body>
    </Modal>
  )
}

/*
  Notification button -> add mail icon
                         Enable, Enabled
                         Enabled activates How Often Drop Down
                              Set up Drop Down
                         State -> Enable, Enabled (with How Often)
  Profie button -> Enable, Enabled?
                   State -> Enable, Enabled
  Continue -> Update Backend with State and Close Modal
  Cancel button -> Close Modal

  tweak :hover and :focus for all buttons?
*/
