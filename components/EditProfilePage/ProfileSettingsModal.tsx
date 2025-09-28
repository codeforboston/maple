import CustomDropdownToggle from "components/BootstrapCustomDropdownToggle"
import { FillButton, OutlineButton, ToggleButton } from "components/buttons"
import { flags } from "components/featureFlags"
import { useTranslation } from "next-i18next"
import { Dispatch, ReactNode, SetStateAction } from "react"
import type { ModalProps } from "react-bootstrap"
import Dropdown from "react-bootstrap/Dropdown"
import { Frequency, Role } from "../auth"
import { Col, Form, Image, Modal, Row } from "../bootstrap"
import { ProfileHook } from "../db"

type Props = Pick<ModalProps, "show" | "onHide"> & {
  actions: ProfileHook
  isProfilePublic: boolean
  role: Role
  setIsProfilePublic: Dispatch<SetStateAction<false | true>>
  notifications: Frequency
  setNotifications: Dispatch<SetStateAction<Frequency>>
  onSettingsModalClose: () => void
}

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

const EmailIcon = () => {
  const { t } = useTranslation("editProfile")

  return (
    <Image
      className={`me-1`}
      src="/mail.svg"
      alt={t("emailIconAlt")}
      width="22"
      height="19"
    />
  )
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
  const handleCancel = async () => {
    onSettingsModalClose()
  }

  async function updateProfile({ actions }: { actions: ProfileHook }) {
    const { updateIsPublic } = actions
    const { updateNotification } = actions

    await updateIsPublic(isProfilePublic)
    await updateNotification(notifications)
  }

  const handleToggleNotifications = async () => {
    if (notifications === "None") {
      setNotifications("Weekly")
    } else {
      setNotifications("None")
    }
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
      <Modal.Header>
        <Modal.Title id="notifications-modal">{t("setting")}</Modal.Title>
        <Image
          src="/x_cancel.png"
          alt={t("navigation.closeNavMenu")}
          width="30"
          height="30"
          className="ms-2"
          onClick={handleCancel}
        />
      </Modal.Header>
      <Modal.Body className={`p-3`}>
        <Form>
          <HideableSection hideIf={!flags().notifications}>
            {/* awaiting the notifications feature to come online */}
            <ModalSubheader title={t("forms.notification")} />
            <Row className={`p-2 d-flex justify-content-md-end`}>
              <Col className={`col-12 col-md-8 mb-3 mb-md-0`}>
                <small>{t("forms.notificationText")}</small>
              </Col>
              <Col className={`col-fill`}>
                <ToggleButton
                  size={"sm"}
                  toggleState={notifications === "None"}
                  stateTrueLabel={t("enable")}
                  stateFalseLabel={t("enabled")}
                  className={`col-12 py-1 rounded-1`}
                  onClick={handleToggleNotifications}
                  Icon={<EmailIcon />}
                />
              </Col>
            </Row>
          </HideableSection>
          <HideableSection
            hideIf={!flags().notifications || notifications === "None"}
          >
            <Row className={`p-2 d-flex justify-content-start`}>
              <Col className={`col-12 col-md-8 mb-3 mb-md-0`}>
                <small>{t("email.frequencyQuery")}</small>
              </Col>
              <Col className={`col-auto ms-auto d-flex flex-grow-1`}>
                <Dropdown align="end" className={`flex-grow-1 d-flex`}>
                  <CustomDropdownToggle
                    label={t(`email.${notifications.toLocaleLowerCase()}`)}
                    className={`btn-sm btn-light py-1 flex-grow-1 d-flex gap-2 justify-content-center align-items-center`}
                    variant="outline-secondary"
                  />
                  <Dropdown.Menu className={`col-12 bg-white `}>
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
            <Col
              className={`col-12 ${role === "user" && "col-md-8"} mb-3 mb-md-0`}
            >
              <small>{privacyText}</small>
            </Col>
            {role === "user" && (
              <Col className={`col-12 col-md-4`}>
                <ToggleButton
                  size={"sm"}
                  className={`py-1 rounded-1`}
                  toggleState={isProfilePublic}
                  stateTrueLabel={t("forms.makePrivate")}
                  stateFalseLabel={t("forms.makePublic")}
                  onClick={() => setIsProfilePublic(current => !current)}
                />
              </Col>
            )}
          </Row>
          <Row className={`p-2 d-flex align-items-start`}>
            <Col md={{ offset: 3 }}>
              <FillButton
                size="sm"
                className={`py-1`}
                onClick={handleSave}
                label={t("save")}
              />
            </Col>
            <Col>
              <OutlineButton
                size="sm"
                className={`py-1 btn-bg-white`}
                onClick={handleCancel}
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
