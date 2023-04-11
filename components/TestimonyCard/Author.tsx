import React from "react"
import styled from "styled-components"
import { usePublicProfile } from "../db"
import { Internal } from "../links"

const StyledName = styled(Internal)`
  text-decoration: none;
`

export const Author = ({ uid, name }: { uid: string; name: string }) => {
  const profile = usePublicProfile(uid)

  const authorName = profile.loading ? "" : profile.result?.fullName
  const linkToProfile = !!profile.result
  return (
    <div>
      {linkToProfile ? (
        <h6>
          <StyledName href={`/profile?id=${uid}`}>{authorName}</StyledName>
        </h6>
      ) : (
        <h6>{name}</h6>
      )}
    </div>
  )
}
