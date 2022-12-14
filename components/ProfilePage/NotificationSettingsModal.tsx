import { AnyARecord } from "dns"
import { useState, Dispatch, SetStateAction } from "react"
import type { ModalProps } from "react-bootstrap"
import Dropdown from "react-bootstrap/Dropdown"
import { useForm } from "react-hook-form"
import { Button, Col, Form, Image, Modal, Stack } from "../bootstrap"
import { Profile, ProfileHook } from "../db"
import styles from "./NotificationSettingsModal.module.css"

type UpdateProfileData = {
  name: string
  aboutYou: string
  twitter: string
  linkedIn: string
  public: boolean
  organization: boolean
  profileImage: any
}

type Props = Pick<ModalProps, "show" | "onHide"> & {
  actions: ProfileHook
  onSettingsModalClose: () => void
  profile: Profile
  profileSettings: string
  setProfileSettings: Dispatch<SetStateAction<"Enable" | "Enabled">>
  uid?: string
}

async function updateProfile(
  {
    profile,
    actions,
    uid
  }: { profile: Profile; actions: ProfileHook; uid?: string },
  data: UpdateProfileData
) {
  const {
    updateIsPublic,
    updateSocial,
    updateAbout,
    updateDisplayName,
    updateFullName
  } = actions

  await updateIsPublic(data.public)
  await updateSocial("linkedIn", data.linkedIn)
  await updateSocial("twitter", data.twitter)
  await updateAbout(data.aboutYou)
  await updateDisplayName(data.name)
  await updateFullName(data.name)
}

export default function NotificationSettingsModal({
  actions,
  onHide,
  onSettingsModalClose,
  profile,
  profileSettings,
  setProfileSettings,
  show,
  uid
}: Props) {
  const { register, handleSubmit } = useForm<UpdateProfileData>()

  const {
    displayName,
    about,
    organization,
    public: isPublic,
    social,
    profileImage
  }: Profile = profile

  const [notifications, setNotifications] = useState<"Enable" | "Enabled">(
    "Enable"
  ) //replace initial state with User data
  const [notificationFrequency, setNotificationFrequency] = useState<
    "Daily" | "Weekly" | "Monthly"
  >("Monthly") //replace initial state with User data

  const onSubmit = handleSubmit(async update => {
    await updateProfile({ profile, actions }, update)

    onSettingsModalClose()
  })

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
          <Button
            className={`
              btn btn-sm ms-auto py-1 ${styles.modalButtonLength}
              ${
                notifications === "Enable"
                  ? "btn-outline-secondary"
                  : "btn-secondary"
              }
            `}
            onClick={() =>
              setNotifications(
                notifications === "Enable" ? "Enabled" : "Enable"
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
            {notifications}
          </Button>
        </Stack>
        <Stack
          className={`
            pt-3 ${styles.modalFontSize} 
            ${notifications === "Enable" ? "invisible" : null} 
          `}
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
              <Dropdown.Item onClick={() => setNotificationFrequency("Daily")}>
                Daily
              </Dropdown.Item>
              <Dropdown.Item onClick={() => setNotificationFrequency("Weekly")}>
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
            // {...register("public")}
            className={`
              btn btn-sm ms-auto py-1 ${styles.modalButtonLength}
              ${
                profileSettings === "Enable"
                  ? "btn-outline-secondary"
                  : "btn-secondary"
              }
            `}
            onClick={() =>
              setProfileSettings(
                profileSettings === "Enable" ? "Enabled" : "Enable"
              )
            }
            // value={profileSettings === "Enabled" ? true : false}
          >
            {profileSettings}
          </Button>
        </Stack>
        <Stack
          className={`d-flex justify-content-end pt-4`}
          direction={`horizontal`}
        >
          <Button className={`btn btn-sm mx-3 py-1`} onClick={onSubmit}>
            Continue
          </Button>
          <Button
            className={`btn btn-sm btn-outline-secondary py-1`}
            onClick={onSettingsModalClose}
          >
            Cancel
          </Button>
        </Stack>
      </Modal.Body>
    </Modal>
  )
}

/*
  Modal State -> Get User data from backend for initial Modal State when Modal onClick of "Settings Component"
                 from parent EditProfilePage.tsx
                 / make sure Cancelling and coming back doesn't leave unsaved edits?
  Continue Button -> [ ] Update Backend with Notifications & Profile Settings State 
                     [x] then Close Modal

  ?
  EditProfilePage -> when AboutMeEditForm tab isDirty, both Settings and View your profile buttons appear disabled
                     however, View your profile is still active dispite appearing otherwise                    
*/
