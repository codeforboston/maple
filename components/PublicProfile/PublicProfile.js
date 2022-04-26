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
  const isPublic = (user && user.public === undefined) || user?.public === false

  const senatorLine = <h4>Senator: {user?.senator?.name}</h4>
  const representativeLine = (
    <h4>Representative: {user?.representative?.name}</h4>
  )
  const twitterLine = (
    <h4>
      Twitter:{" "}
      <links.External href={`https://www.twitter.com/${twit}`}>
        @{twit}
      </links.External>
    </h4>
  )

  const linkedInLine = (
    <h4>
      LinkedIn:{" "}
      <links.External href={`https://www.linkedin.com/in/${linkedIn}`}>
        {linkedIn}
      </links.External>
    </h4>
  )

  const publicProfile = (
    <>
      {user?.senator ? senatorLine : <></>}
      {user?.representative ? representativeLine : <></>}
      {twit ? twitterLine : <></>}
      {linkedIn ? linkedInLine : <></>}

      <p>{bio}</p>
      <UserTestimonies authorId={id} />
    </>
  )
  return (
    <>
      <h1>{user?.displayName}</h1>
      {isPublic && publicProfile}
      {!isPublic && <h3>Profile is not public</h3>}
    </>
  )
}

export default PublicProfile
