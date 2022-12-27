import { Dispatch, SetStateAction } from "react"
import type { ModalProps } from "react-bootstrap"
import Dropdown from "react-bootstrap/Dropdown"
import { useForm } from "react-hook-form"
import { Frequency } from "../auth"
import { Button, Col, Form, Image, Modal, Stack } from "../bootstrap"
import { ProfileHook } from "../db"
import styles from "./NotificationSettingsModal.module.css"

type UpdateProfileData = {
  private: string
  notificationFrequency: Frequency
  notificationActive: string
}

type Props = Pick<ModalProps, "show" | "onHide"> & {
  actions: ProfileHook
  onSettingsModalClose: () => void
  notifications: string
  setNotifications: Dispatch<SetStateAction<"Daily" | "Weekly" | "Monthly">>
  notificationsEnabled: string
  setNotificationsEnabled: Dispatch<SetStateAction<"On" | "">>
  profileSettings: string
  setProfileSettings: Dispatch<SetStateAction<"On" | "">>
}

export default function NotificationSettingsModal({
  actions,
  notifications,
  setNotifications,
  notificationsEnabled,
  setNotificationsEnabled,
  onHide,
  onSettingsModalClose,
  profileSettings,
  setProfileSettings,
  show
}: Props) {
  const { register, handleSubmit } = useForm<UpdateProfileData>()

  const onSubmit = handleSubmit(async update => {
    await updateProfile({ actions }, update)

    onSettingsModalClose()
  })

  async function updateProfile(
    { actions }: { actions: ProfileHook },
    data: UpdateProfileData
  ) {
    const { updateIsPrivate } = actions
    const { updateNotification } = actions
    const { updateNotificationActive } = actions

    await updateIsPrivate(profileSettings)
    // await updateIsPrivate(data.private)
    await updateNotification(data.notificationFrequency)
    await updateNotificationActive(data.notificationActive)
  }

  console.log("Private: ", profileSettings)

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
        <Form onSubmit={onSubmit}>
          <Stack>
            &nbsp; Notifications
            <hr className={`mt-0`} />
          </Stack>
          <Stack className={`${styles.modalFontSize}`} direction={`horizontal`}>
            <Col className={`col-8`}>
              Would you like to receive updates about bills/organizations you
              follow through email?
            </Col>
            <Button
              {...register("notificationActive")}
              className={`
              btn btn-sm ms-auto py-1 ${styles.modalButtonLength}
              ${
                notificationsEnabled === "On"
                  ? "btn-secondary"
                  : "btn-outline-secondary"
              }
            `}
              onClick={() =>
                setNotificationsEnabled(
                  notificationsEnabled === "On" ? "" : "On"
                )
              }
              value={notificationsEnabled}
            >
              <Image
                className={`pe-1`}
                src="/mail-2.svg"
                alt="open envelope with letter, toggles update frequency options"
                width="22"
                height="19"
              />
              {notificationsEnabled === "On" ? "Enabled" : "Enable"}
            </Button>
          </Stack>
          <Stack
            className={`
            pt-3 ${styles.modalFontSize} 
            ${notificationsEnabled === "On" ? "" : "invisible"} 
          `}
            direction={`horizontal`}
          >
            <Col className={`col-8`}>
              How often would you like to receive emails?
            </Col>
            <Dropdown className={`d-inline-block ms-auto`}>
              <Dropdown.Toggle
                {...register("notificationFrequency")}
                className={`btn-sm py-1 ${styles.modalButtonLength}`}
                variant="outline-secondary"
                id="dropdown-basic"
                value={notifications}
              >
                {notifications}
              </Dropdown.Toggle>

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
          </Stack>
          <Stack className={`pt-4`}>
            &nbsp; Profile Settings
            <hr className={`mt-0`} />
          </Stack>
          <Stack className={`${styles.modalFontSize}`} direction={`horizontal`}>
            <Col className={`col-8`}>
              Don't make my profile public. (Your name will still be associated
              with your testimony.)
            </Col>
            <Button
              // {...register("private")}
              className={`
              btn btn-sm ms-auto py-1 ${styles.modalButtonLength}
              ${
                profileSettings === "On"
                  ? "btn-secondary"
                  : "btn-outline-secondary"
              }
            `}
              onClick={() =>
                setProfileSettings(profileSettings === "On" ? "" : "On")
              }
              // value={profileSettings}
            >
              {profileSettings === "On" ? "Enabled" : "Enable"}
            </Button>
          </Stack>
          <Stack
            className={`d-flex justify-content-end pt-4`}
            direction={`horizontal`}
          >
            <Button className={`btn btn-sm mx-3 py-1`} type="submit">
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
      </Modal.Body>
    </Modal>
  )
}

/*
  Modal State ->     [x] Get User data from backend for initial Modal State when Modal onClick of "Settings Component"
                     from parent EditProfilePage.tsx
                     / make sure Cancelling and coming back doesn't leave unsaved edits?
  Continue Button -> [x] Update Backend with Notifications & 
                     [x] Profile Settings State 
                     [x] then Close Modal

  ?
  EditProfilePage -> when AboutMeEditForm tab isDirty, both Settings and View your profile buttons appear disabled
                     however, View your profile is still active dispite appearing otherwise
                     
  if you're already at your profile page and sign out/on, your profile doesn't update until you refresh the page

  updateProfileImage does not appear implemented on AboutMeEditForm
*/
