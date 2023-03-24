import { is } from "immer/dist/internal"
import { useCallback, useState } from "react"
import { useAuth } from "../auth"
import { Button, Col, Container, Nav, Row, Spinner } from "../bootstrap"
import {
  Profile,
  ProfileHook,
  useProfile,
  usePublishedTestimonyListing
} from "../db"
import { Internal } from "../links"

export function UnsubscribeConfirm() {
  const { user } = useAuth()
  const isUser = user?.uid !== undefined
  // const uid = user?.uid
  // const result = useProfile()

  const handleClick = async () => {
    // await updateProfile({ actions })
    // onSettingsModalClose()

    console.log()

    // update profile
    // then go to home/profile page
  }

  const handleCancel = async () => {
    // await updateProfile({ actions })
    // onSettingsModalClose()

    console.log()

    // go to home/profile page
  }

  return (
    <>
      {isUser ? (
        <>
          <div>
            Confirm that you would like to Unsubscribe from Notification Emails
          </div>
          <div>
            You can change these settings at any time from Edit Profile page
            with the '* Settings' button
          </div>
          <Button className={`btn btn-sm mx-3 py-1`} onClick={handleClick}>
            Continue
          </Button>
          <Button
            className={`btn btn-sm btn-outline-secondary py-1`}
            onClick={handleCancel}
          >
            Cancel
          </Button>
        </>
      ) : (
        <>
          <div>if logged out; instructions for logging in first</div>
        </>
      )}
    </>
  )
}
