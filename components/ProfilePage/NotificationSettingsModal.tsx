import type { ModalProps } from "react-bootstrap"
import { Button, Col, Container, Image, Modal, Row, Stack } from "../bootstrap"
import styles from "./NotificationSettingsModal.module.css"

export default function NotificationSettingsModal({
  show,
  onHide,
  onCancelClick
}: Pick<ModalProps, "show" | "onHide"> & {
  onCancelClick: () => void
}) {
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
      <Modal.Body className={styles.xthinContainer}>
        <Stack>
          &nbsp; Notifications
          <hr className={`mt-0`} />
        </Stack>
        <Stack
          className={`${styles.NotificationSmallFontSize}`}
          direction={`horizontal`}
          gap={3}
        >
          <Col className={`col-9`}>
            Would you like to receive updates about bills/organizations you
            follow through email?
          </Col>
          <Button
            className={`btn btn-sm btn-outline-secondary ms-auto py-1 ${styles.NotificationButtonLength}`}
          >
            {"C Enable"}
          </Button>
        </Stack>
        <Stack className={`pt-5`}>
          &nbsp; Profile Settings
          <hr className={`mt-0`} />
        </Stack>
        <Stack
          className={`${styles.NotificationSmallFontSize}`}
          direction={`horizontal`}
          gap={3}
        >
          <Col className={`col-9`}>
            Don't make my profile public. (Your name will still be associated
            with your testimony.)
          </Col>
          <Button
            className={`btn btn-sm btn-outline-secondary ms-auto py-1 ${styles.NotificationButtonLength}`}
          >
            {"Enable"}
          </Button>
        </Stack>
        <Stack
          className={`d-flex justify-content-end pt-4`}
          direction={`horizontal`}
        >
          <Button className={`btn btn-sm mx-3 py-1`}>Continue</Button>
          <Button
            className={`btn btn-sm btn-outline-secondary py-1`}
            onClick={onCancelClick}
          >
            Cancel
          </Button>
        </Stack>
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

  tweak :hover and :focus for all buttons?

  responsive check on Edit Profile page
*/
