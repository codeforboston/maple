import { useState } from "react"
import type { ModalProps } from "react-bootstrap"
import Dropdown from "react-bootstrap/Dropdown"
import { Button, Col, Image, Modal, Stack } from "../bootstrap"
import styles from "./NotificationSettingsModal.module.css"

export default function NotificationSettingsModal({
  show,
  onHide,
  onCancelClick
}: Pick<ModalProps, "show" | "onHide"> & {
  onCancelClick: () => void
}) {
  const [notifications, setNotifications] = useState<"enable" | "enabled">(
    "enable"
  ) //replace initial state with User data
  const [notificationFrequency, setNotificationFrequency] = useState<
    "Daily" | "Weekly" | "Monthly"
  >("Monthly") //replace initial state with User data
  const [profileSettings, setProfileSettings] = useState<"enable" | "enabled">(
    "enable"
  ) //replace initial state with User data

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
      <Modal.Body className={styles.modalContainer}>
        <Stack>
          &nbsp; Notifications
          <hr className={`mt-0`} />
        </Stack>
        <Stack className={`${styles.modalFontSize}`} direction={`horizontal`}>
          <Col className={`col-8`}>
            Would you like to receive updates about bills/organizations you
            follow through email?
          </Col>
          {notifications === "enable" ? (
            <Button
              className={`btn btn-sm btn-outline-secondary ms-auto py-1 ${styles.modalButtonLength}`}
              onClick={() => setNotifications("enabled")}
            >
              <Image
                className={`pe-1`}
                src="/mail-2.svg"
                alt="open envelope with letter, toggles update frequency options"
                width="22"
                height="19"
              />
              {"Enable"}
            </Button>
          ) : (
            <Button
              className={`btn btn-sm btn-secondary ms-auto py-1 ${styles.modalButtonLength}`}
              onClick={() => setNotifications("enable")}
            >
              <Image
                className={`pe-1`}
                src="/mail-2.svg"
                alt="open envelope with letter, toggles update frequency options"
                width="22"
                height="19"
              />
              {"Enabled"}
            </Button>
          )}
        </Stack>
        {notifications === "enable" ? (
          <Stack
            className={`pt-3 ${styles.modalFontSize}`}
            direction={`horizontal`}
          >
            <Col className={`col-8`}>
              <Button
                className={`btn btn-sm invisible py-1 ${styles.modalButtonLength}`}
              >
                {"Placeholder"}
                {/* Maintains spacing when Notifactions are not enabled */}
              </Button>
            </Col>
          </Stack>
        ) : (
          <Stack
            className={`pt-3 ${styles.modalFontSize}`}
            direction={`horizontal`}
          >
            <Col className={`col-8`}>
              How often would you like to receive emails?
            </Col>
            <Dropdown className={`d-inline-block ms-auto`}>
              <Dropdown.Toggle
                className={`btn-sm py-1 ${styles.modalButtonLength}`}
                variant="outline-secondary"
                id="dropdown-basic"
              >
                {notificationFrequency}
              </Dropdown.Toggle>

              <Dropdown.Menu>
                <Dropdown.Item
                  onClick={() => setNotificationFrequency("Daily")}
                >
                  Daily
                </Dropdown.Item>
                <Dropdown.Item
                  onClick={() => setNotificationFrequency("Weekly")}
                >
                  Weekly
                </Dropdown.Item>
                <Dropdown.Item
                  onClick={() => setNotificationFrequency("Monthly")}
                >
                  Monthly
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Stack>
        )}
        <Stack className={`pt-4`}>
          &nbsp; Profile Settings
          <hr className={`mt-0`} />
        </Stack>
        <Stack className={`${styles.modalFontSize}`} direction={`horizontal`}>
          <Col className={`col-8`}>
            Don't make my profile public. (Your name will still be associated
            with your testimony.)
          </Col>
          {profileSettings === "enable" ? (
            <Button
              className={`btn btn-sm btn-outline-secondary ms-auto py-1 ${styles.modalButtonLength}`}
              onClick={() => setProfileSettings("enabled")}
            >
              {"Enable"}
            </Button>
          ) : (
            <Button
              className={`btn btn-sm btn-secondary ms-auto py-1 ${styles.modalButtonLength}`}
              onClick={() => setProfileSettings("enable")}
            >
              {"Enabled"}
            </Button>
          )}
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
  Continue -> [ ] Update Backend with Notifications & Profile Settings State 
              [ ] then Close Modal
*/
