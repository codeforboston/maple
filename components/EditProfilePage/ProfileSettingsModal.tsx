import { useTranslation } from "next-i18next"
import { Dispatch, SetStateAction } from "react"
import type { ModalProps } from "react-bootstrap"
import Dropdown from "react-bootstrap/Dropdown"
import styled from "styled-components"
import { Frequency } from "../auth"
import { Button, Col, Form, Image, Modal, Row, Stack } from "../bootstrap"
import { ProfileHook } from "../db"
import { Role } from "../auth"

type Props = Pick<ModalProps, "show" | "onHide"> & {
  actions: ProfileHook
  isProfilePublic: boolean
  role: Role
  setIsProfilePublic: Dispatch<SetStateAction<false | true>>
  notifications: Frequency
  setNotifications: Dispatch<
    SetStateAction<"Daily" | "Weekly" | "Monthly" | "None">
  >
  onSettingsModalClose: () => void
}

const StyledButton = styled(Button)`
  &:focus {
    color: white;
    background-color: #1a3185;
    border-color: white;
  }
  &:hover {
    color: #1a3185;
    background-color: white;
    border-color: #1a3185;
  }
  width: 110px;
`

const StyledOutlineButton = styled(Button)`
  &:focus {
    color: #1a3185;
    background-color: white;
    border-color: #1a3185;
  }
  &:hover {
    color: white;
    background-color: #1a3185;
    border-color: white;
  }
  width: 110px;
`

const StyledOutlineButton2 = styled(Button)`
  &:focus {
    color: #1a3185;
    background-color: white;
    border-color: #1a3185;
  }
  &:hover {
    color: white;
    background-color: #1a3185;
    border-color: white;
  }
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

function RenderPrivacyText(role: Role, isPublic: boolean) {
  const { t } = useTranslation("editProfile")

  switch (role) {
    case "organization":
      return t("privacyText.organization")
    case "pendingUpgrade":
      return t("privacyText.pendingUpgrade")
    case "user":
      if (isPublic) {
        return t("privacyText.publicUser")
      }
      return t("privacyText.privateUser")
  }
}

export default function ProfileSettingsModal({
  actions,
  isProfilePublic,
  role,
  setIsProfilePublic,
  notifications,
  setNotifications,
  onHide,
  onSettingsModalClose,
  show
}: Props) {
  const handleSave = async () => {
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

  const privacyText = RenderPrivacyText(role, isProfilePublic)
  const { t } = useTranslation("editProfile")

  return (
    <Modal
      show={show}
      onHide={onHide}
      aria-labelledby="notifications-modal"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="notifications-modal">{t("setting")}</Modal.Title>
      </Modal.Header>
      <StyledModalBody>
        <Form>
          <div
            /* remove "div w/ d-none" for testing and/or after Soft Launch 
               when we're ready to show Email related element to users
            */
            className="d-none"
          >
            <StyledRow className="p-2">
              <h5 className="p-0"> &nbsp; {t("forms.notification")}</h5>
              <hr className={`mt-0`} />
              <Col className={`col-8`}>{t("forms.notificationText")}</Col>
              <Col>
                {notifications === "None" ? (
                  <StyledOutlineButton
                    className={`btn btn-sm d-flex justify-content-end ms-auto py-1 btn-outline-secondary`}
                    onClick={() => setNotifications("Monthly")}
                  >
                    <Image
                      className={`pe-1`}
                      src="/mail-2.svg"
                      alt="open envelope with letter, toggles update frequency options"
                      width="22"
                      height="19"
                    />
                    {"Enable"}
                  </StyledOutlineButton>
                ) : (
                  <StyledButton
                    className={`btn btn-sm d-flex justify-content-end ms-auto py-1 btn-secondary`}
                    onClick={() => setNotifications("None")}
                  >
                    <Image
                      className={`pe-1`}
                      src="/mail-icon-sized-for-buttons.svg"
                      alt="open envelope with letter, toggles update frequency options"
                      width="22"
                      height="19"
                    />
                    {"Enabled"}
                  </StyledButton>
                )}
              </Col>
            </StyledRow>
            <StyledRow
              className={`p-2 ${notifications === "None" ? "invisible" : ""}`}
              direction={`horizontal`}
            >
              <Col className={`col-8`}>{t("email.frequencyQuery")}</Col>
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
                      {t("email.daily")}
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => setNotifications("Weekly")}>
                      {t("email.weekly")}
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => setNotifications("Monthly")}>
                      {t("email.monthly")}
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </Col>
            </StyledRow>
          </div>

          <StyledRow className="p-2">
            <h5 className="p-0">&nbsp; {t("privacySetting")}</h5>
            <hr />

            <Col>{privacyText}</Col>
            {role === "user" && (
              <Col xs={4}>
                <StyledButton
                  className={`w-100 btn-sm d-flex justify-content-center ms-auto py-1 ${
                    isProfilePublic ? "btn-outline-secondary" : "btn-secondary"
                  }`}
                  onClick={() =>
                    setIsProfilePublic(isProfilePublic ? false : true)
                  }
                >
                  {isProfilePublic
                    ? t("forms.makePrivate")
                    : t("forms.makePublic")}
                </StyledButton>
              </Col>
            )}
          </StyledRow>

          <Stack
            className={`d-flex justify-content-end pt-4`}
            direction={`horizontal`}
          >
            <Button className={`btn btn-sm mx-3 py-1`} onClick={handleSave}>
              {t("save")}
            </Button>
            <StyledOutlineButton2
              className={`btn btn-sm btn-outline-secondary py-1`}
              onClick={onSettingsModalClose}
            >
              {t("cancel")}
            </StyledOutlineButton2>
          </Stack>
        </Form>
      </StyledModalBody>
    </Modal>
  )
}
