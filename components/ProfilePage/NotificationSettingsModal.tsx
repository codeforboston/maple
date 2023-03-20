import { Dispatch, SetStateAction } from "react"
import type { ModalProps } from "react-bootstrap"
import Dropdown from "react-bootstrap/Dropdown"
import styled from "styled-components"
import { Frequency } from "../auth"
import { Button, Col, Form, Image, Modal, Row, Stack } from "../bootstrap"
import { ProfileHook } from "../db"

type Props = Pick<ModalProps, "show" | "onHide"> & {
  actions: ProfileHook
  isProfilePublic: boolean
  setIsProfilePublic: Dispatch<SetStateAction<false | true>>
  notifications: Frequency
  setNotifications: Dispatch<
    SetStateAction<"Daily" | "Weekly" | "Monthly" | "None">
  >
  onSettingsModalClose: () => void
}

const StyledButton = styled(Button)`
  width: 110px;
`

const StyledDropdownToggle = styled(Dropdown.Toggle)`
  width: 110px;
`

const StyledModalBody = styled(Modal.Body)`
  padding: 0.8rem;
`

const StyledRow = styled(Row)`
  font-size: 12px;
`

export default function NotificationSettingsModal({
  actions,
  isProfilePublic,
  setIsProfilePublic,
  notifications,
  setNotifications,
  onHide,
  onSettingsModalClose,
  show
}: Props) {
  const handleContinue = async () => {
    await updateProfile({ actions })
    onSettingsModalClose()
  }

  async function updateProfile({ actions }: { actions: ProfileHook }) {
    const { updateIsPublic } = actions
    const { updateNotification } = actions

    await updateIsPublic(isProfilePublic)
    await updateNotification(notifications)
  }

  // button classNames weren't otherwise properly updating on iOS
  let buttonSecondary = "btn-secondary"
  if (notifications === "None") {
    buttonSecondary = "btn-outline-secondary"
  }

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
      <StyledModalBody>
        <Form>
          <div
            /* remove "div w/ d-none" for testing and/or after Soft Launch 
               when we're ready to show Email related element to users
            */
            className={`d-none`}
          >
            <Stack>
              &nbsp; Notifications
              <hr className={`mt-0`} />
            </Stack>
            <StyledRow>
              <Col className={`col-8`}>
                Would you like to receive updates about bills/organizations you
                follow through email?
              </Col>
              <Col>
                <StyledButton
                  className={`btn btn-sm d-flex justify-content-end ms-auto py-1 ${buttonSecondary}`}
                  onClick={() =>
                    setNotifications(
                      notifications === "None" ? "Monthly" : "None"
                    )
                  }
                >
                  <Image
                    className={`pe-1`}
                    src="/mail-2.svg"
                    alt="open envelope with letter, toggles update frequency options"
                    width="22"
                    height="19"
                  />
                  {notifications === "None" ? "Enable" : "Enabled"}
                </StyledButton>
              </Col>
            </StyledRow>
            <StyledRow
              className={`pt-3 ${notifications === "None" ? "invisible" : ""}`}
              direction={`horizontal`}
            >
              <Col className={`col-8`}>
                How often would you like to receive emails?
              </Col>
              <Col className={`d-flex justify-content-end`}>
                <Dropdown className={`d-inline-block ms-auto`}>
                  <StyledDropdownToggle
                    className={`btn-sm py-1`}
                    variant="outline-secondary"
                    id="dropdown-basic"
                  >
                    {notifications}
                  </StyledDropdownToggle>
                  <Dropdown.Menu>
                    <Dropdown.Item onClick={() => setNotifications("Daily")}>
                      Daily
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => setNotifications("Weekly")}>
                      Weekly
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => setNotifications("Monthly")}>
                      Monthly
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </Col>
            </StyledRow>
          </div>
          <Stack className={`pt-4`}>
            &nbsp; Profile Settings
            <hr className={`mt-0`} />
          </Stack>
          <StyledRow>
            <Col className={`col-8`}>
              Don't make my profile public. (Your name will still be associated
              with your testimony.)
            </Col>
            <Col>
              <StyledButton
                className={`btn btn-sm d-flex justify-content-center ms-auto py-1 ${
                  isProfilePublic === true
                    ? "btn-outline-secondary"
                    : "btn-secondary"
                }`}
                onClick={() =>
                  setIsProfilePublic(isProfilePublic === true ? false : true)
                }
              >
                {isProfilePublic === true ? "Enable" : "Enabled"}
              </StyledButton>
            </Col>
          </StyledRow>
          <Stack
            className={`d-flex justify-content-end pt-4`}
            direction={`horizontal`}
          >
            <Button className={`btn btn-sm mx-3 py-1`} onClick={handleContinue}>
              Continue
            </Button>
            <Button
              className={`btn btn-sm btn-outline-secondary py-1`}
              onClick={onSettingsModalClose}
            >
              Cancel
            </Button>
          </Stack>
        </Form>
      </StyledModalBody>
    </Modal>
  )
}
