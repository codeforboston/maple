import React from "react"
import { usePublicProfile } from "../db"
import UserTestimonies from "../UserTestimonies/UserTestimonies"

const PublicProfile = ({ id }) => {
  const profile = usePublicProfile(id)
  const user = profile.result

  const bio = `Ipsum eu proident qui occaecat et nisi non nostrud Lorem quis. Minim ex proident non tempor veniam minim non elit ipsum non incididunt laborum pariatur excepteur. Quis excepteur Lorem id nisi quis nostrud veniam enim id officia ullamco adipisicing consectetur. Duis eiusmod aliqua proident in sunt deserunt non. Non veniam cillum mollit non ex enim ut deserunt in veniam tempor ex mollit. Veniam est aliquip cillum ad dolore sint. Sint magna est eu laborum occaecat tempor minim nulla velit.`
  const twit = "fakename"
  const linkedIn = "https://www.linkedin.com/in/fakename/"

  return (
    <>
      <h1>{user?.displayName ? user?.displayName : "Name placeholder"}</h1>
      <h4>Senator: {user?.senator?.name}</h4>
      <h4>Representative: {user?.representative?.name}</h4>
      <h4>Twitter: @{twit}</h4>
      <h4>LinkedIn:{linkedIn}</h4>
      <p>{bio}</p>
      <UserTestimonies authorId={id} />
    </>
  )
}

export default PublicProfile
