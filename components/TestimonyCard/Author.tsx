import React from "react"
import styled from "styled-components"
import { usePublicProfile } from "../db"
import { Internal } from "../links"

const StyledName = styled(Internal)`
  text-decoration: none;
`

export const Author = ({ uid, name }: { uid: string; name: string }) => {
  // Check if profile is public, or user is owner of testimony
  const profile = usePublicProfile(uid)
  const linkToProfile = !!profile.result
  return (
    <div>
      <h6>
        {linkToProfile ? (
          <StyledName href={`/profile?id=${uid}`}>{name}</StyledName>
        ) : (
          name
        )}
      </h6>
    </div>
  )
}
