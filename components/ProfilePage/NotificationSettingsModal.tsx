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
          <Col className={`col-8`}>
            Would you like to receive updates about bills/organizations you
            follow through email?
          </Col>
          <Button className={`btn btn-sm btn-outline-secondary ms-auto py-1`}>
            <svg
              width="22"
              height="19"
              viewBox="0 0 92 84"
              fill="none"
              className={`me-1`}
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M0.75 32.1359L46.125 17.8539L91.5 32.1359V83.313H0.75V32.1359Z"
                fill="white"
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M46.125 63.1279L35.1659 55.1307L4.61993 81.313H87.6301L57.0842 55.1307L46.125 63.1279ZM58.8128 53.9783L89.5 80.2816V34.583L58.8128 53.9783ZM91.5 83.313H0.75V32.1359L46.125 17.8539L91.5 32.1359V83.313ZM88.036 33.1423L46.125 19.9507L4.21405 33.1423L35.6785 53.0289L46.125 60.6521L56.5715 53.0289L88.036 33.1423ZM2.75 34.583L33.4372 53.9783L2.75 80.2816V34.583Z"
                fill="#12266F"
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M18.0568 0.577515C14.7431 0.577515 12.0568 3.26381 12.0568 6.57752V40.3681L46.1249 63.0802L79.0035 40.5606V6.57751C79.0035 3.26381 76.3172 0.577515 73.0035 0.577515H18.0568Z"
                fill="white"
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M18.2168 13.1076C18.2168 12.5554 18.6646 12.1076 19.2168 12.1076H70.0534C70.6057 12.1076 71.0534 12.5554 71.0534 13.1076C71.0534 13.6599 70.6057 14.1076 70.0534 14.1076H19.2168C18.6646 14.1076 18.2168 13.6599 18.2168 13.1076ZM18.2168 20.9837C18.2168 20.4314 18.6646 19.9837 19.2168 19.9837H35.327C35.8793 19.9837 36.327 20.4314 36.327 20.9837C36.327 21.536 35.8793 21.9837 35.327 21.9837H19.2168C18.6646 21.9837 18.2168 21.536 18.2168 20.9837ZM41.1291 20.9837C41.1291 20.4314 41.5768 19.9837 42.1291 19.9837H72.9174C73.4697 19.9837 73.9174 20.4314 73.9174 20.9837C73.9174 21.536 73.4697 21.9837 72.9174 21.9837H42.1291C41.5768 21.9837 41.1291 21.536 41.1291 20.9837ZM18.2168 29.5758C18.2168 29.0235 18.6646 28.5758 19.2168 28.5758H24.2289C24.7812 28.5758 25.2289 29.0235 25.2289 29.5758C25.2289 30.1281 24.7812 30.5758 24.2289 30.5758H19.2168C18.6646 30.5758 18.2168 30.1281 18.2168 29.5758ZM29.315 29.5758C29.315 29.0235 29.7627 28.5758 30.315 28.5758H70.0534C70.6057 28.5758 71.0534 29.0235 71.0534 29.5758C71.0534 30.1281 70.6057 30.5758 70.0534 30.5758H30.315C29.7627 30.5758 29.315 30.1281 29.315 29.5758ZM18.2168 36.0199C18.2168 35.4676 18.6646 35.0199 19.2168 35.0199H62.8933C63.4456 35.0199 63.8933 35.4676 63.8933 36.0199C63.8933 36.5722 63.4456 37.0199 62.8933 37.0199H19.2168C18.6646 37.0199 18.2168 36.5722 18.2168 36.0199ZM27.512 48.2679L14.0568 39.2977V6.57752C14.0568 4.36838 15.8476 2.57751 18.0568 2.57751H73.0035C75.2126 2.57751 77.0035 4.36838 77.0035 6.57751V39.5063L64.2143 48.266H33.179C32.6267 48.266 32.179 48.7138 32.179 49.266C32.179 49.8183 32.6267 50.266 33.179 50.266H61.2943L50.1018 57.9321H42.0084L28.3491 48.8259C28.1948 48.5116 27.8803 48.2901 27.512 48.2679ZM12.0568 40.3681V6.57752C12.0568 3.26381 14.7431 0.577515 18.0568 0.577515H73.0035C76.3172 0.577515 79.0035 3.26381 79.0035 6.57751V40.5606L46.1249 63.0802L12.0568 40.3681ZM45.0084 59.9321L46.1098 60.6664L47.1818 59.9321H45.0084Z"
                fill="#12266F"
              />
            </svg>

            {"Enable"}
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
          <Col className={`col-8`}>
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
  Notification button -> Enable, Enabled
                         Enabled activates How Often Drop Down
                              Set up Drop Down
                         State -> Enable, Enabled (with How Often)
  Profie button -> Enable, Enabled?
                   State -> Enable, Enabled
  Continue -> Update Backend with State and Close Modal

  tweak :hover and :focus for all buttons?
*/
