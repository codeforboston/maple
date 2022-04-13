import React from "react"
import { usePublicProfile } from "../db"
import UserTestimonies from "../UserTestimonies/UserTestimonies"
import * as links from "../../components/links.tsx"

const PublicProfile = ({ id }) => {
  const profile = usePublicProfile(id)
  const user = profile.result
  const bio = user?.about
  const twit = user?.social?.twitter
  const linkedIn = user?.social?.linkedIn

  return (
    <>
      <h1>{user?.displayName ? user?.displayName : "Name placeholder"}</h1>
      <h4>Senator: {user?.senator?.name}</h4>
      <h4>Representative: {user?.representative?.name}</h4>
      <h4>
        Twitter:{" "}
        <links.External href={`https://www.twitter.com/${twit}`}>
          @{twit}
        </links.External>
      </h4>
      <h4>
        LinkedIn:{" "}
        <links.External href={`https://www.linkedin.com/in/${linkedIn}`}>
          {linkedIn}
        </links.External>
      </h4>
      <p>{bio}</p>
      <UserTestimonies authorId={id} />
    </>
  )
}

export default PublicProfile
