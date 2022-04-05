import React from "react"
import { Button } from "react-bootstrap"
import { Wrap } from "../../components/links"
// import { usePublicProfile } from "../db"

const ProfileButton = ({ uid, displayName }) => {
  // we can get the display name via usePublicProfile() as below once it is saved in the profile
  // const profile = usePublicProfile(id)
  // const user = profile.result
  return (
    <Wrap href={`/publicprofile?id=${uid}`}>
      <Button>{displayName}</Button>
    </Wrap>
  )
}
export default ProfileButton
