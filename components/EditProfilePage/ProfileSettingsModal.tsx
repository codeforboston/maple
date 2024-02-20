import { FillButton, OutlineButton, ToggleButton } from "components/buttons"
import { flags } from "components/featureFlags"
import { useTranslation } from "next-i18next"
import { Dispatch, ReactNode, SetStateAction } from "react"
import type { ModalProps } from "react-bootstrap"
import Dropdown from "react-bootstrap/Dropdown"
import styled from "styled-components"
import { Frequency, Role } from "../auth"
import { Button, Col, Form, Image, Modal, Row } from "../bootstrap"
import { ProfileHook } from "../db"

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

// const StyledRow = styled(Row)`
//   font-size: 12px;
// `

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
    case "admin":
      return t("privacyText.admin")
    default:
      return t("privacyText.default")
  }
}

const EmailIcon = () => (
  <Image
    className={`me-1`}
    src="/mail.svg"
    alt="open envelope with letter, toggles update frequency options"
    width="22"
    height="19"
  />
)

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
      <Modal.Body className={`p-3`}>
        <Form>
          <HideableSection hideIf={!flags().notifications}>
            {/* awaiting the notifications feature to come online */}
            <ModalSubheader title={t("forms.notification")} />
            <Row className={`p-2 d-flex justify-content-end`}>
              <Col className={`col-8`}>
                <small>{t("forms.notificationText")}</small>
              </Col>
              <Col className={`col-fill`}>
                <ToggleButton
                  size={"sm"}
                  toggleState={notifications === "None"}
                  stateTrueLabel={t("enable")}
                  stateFalseLabel={t("enabled")}
                  className={`col-12 py-1 rounded-1`}
                  onClick={() => setNotifications("Monthly")}
                  Icon={<EmailIcon />}
                />
              </Col>
            </Row>
          </HideableSection>
          <HideableSection
            hideIf={!flags().notifications || notifications === "None"}
          >
            <Row className={`p-2 d-flex justify-content-start`}>
              <Col className={`col-8`}>
                <small>{t("email.frequencyQuery")}</small>
              </Col>
              <Col className={`col-auto ms-auto d-flex flex-grow-1`}>
                <Dropdown align="end" className={`flex-grow-1 d-flex`}>
                  <Dropdown.Toggle
                    className={`btn-sm btn-light py-1 flex-grow-1 d-flex justify-content-evenly align-items-center`}
                    variant="outline-secondary"
                    id="dropdown-basic"
                  >
                    {t(`email.${notifications.toLocaleLowerCase()}`)}
                  </Dropdown.Toggle>
                  <Dropdown.Menu className={`col-12 bg-white `}>
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
            </Row>
          </HideableSection>
          <ModalSubheader title={t("privacySetting")} />
          <Row className={`p-2 d-flex justify-content-start`}>
            <Col>
              <small>{privacyText}</small>
            </Col>
            <Col xs={4}>
              <ToggleButton
                disabled={role !== "user"}
                size={"sm"}
                className={`btn-sm col-12 py-1 rounded-1`}
                toggleState={isProfilePublic}
                stateTrueLabel={t("forms.makePublic")}
                stateFalseLabel={t("forms.makePrivate")}
                onClick={() => setIsProfilePublic(current => !current)}
              />
            </Col>
          </Row>

          <Row className={`p-2`}>
            <Col className={`d-flex gap-3`}>
              <FillButton
                size="sm"
                className={`col-3 ms-auto py-1`}
                onClick={handleSave}
                label={t("save")}
              />
              <OutlineButton
                size="sm"
                className={`col-3 mx-2 py-1 btn-bg-white`}
                onClick={handleSave}
                label={t("cancel")}
              />
            </Col>
          </Row>
        </Form>
      </Modal.Body>
    </Modal>
  )
}

export const ModalSubheader = ({ title }: { title: string }) => {
  return (
    <Row className="pt-2 pb-0 px-2">
      <Col>
        <h5 className="p-0">{title}</h5>
      </Col>
      <hr />
    </Row>
  )
}

export const HideableSection = ({
  hideIf,
  children
}: {
  hideIf?: boolean
  children: ReactNode
}) => {
  if (hideIf) return null
  else return children
}

// <StyledOutlineButton
//   className={`btn btn-sm d-flex justify-content-end ms-auto py-1 btn-outline-secondary`}
//   onClick={() => setNotifications("Monthly")}
// >
//   <Image
//     className={`pe-1`}
//     src="/mail-2.svg"
//     alt="open envelope with letter, toggles update frequency options"
//     width="22"
//     height="19"
//   />
//   {"Enable"}
// </StyledOutlineButton>

// <StyledButton
//   className={`btn btn-sm d-flex justify-content-end ms-auto py-1 btn-secondary`}
//   onClick={() => setNotifications("None")}
// >
//   <Image
//     className={`pe-1`}
//     src="/mail-icon-sized-for-buttons.svg"
//     alt="open envelope with letter, toggles update frequency options"
//     width="22"
//     height="19"
//   />
//   {"Enabled"}
// </StyledButton>
