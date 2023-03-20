import React from "react"
import styled from "styled-components"
import { Testimony, usePublicProfile } from "../db"
import { Internal } from "../links"

export const Author = styled<{ testimony: Testimony }>(
  ({ testimony, ...props }) => {
    const profile = usePublicProfile(testimony.authorUid)

    const authorName = profile.loading
      ? ""
      : profile.result?.fullName ?? testimony.authorDisplayName ?? "Anonymous"
    const linkToProfile = !!profile.result
    return (
      <div {...props}>
        {linkToProfile ? (
          <Internal href={`/profile?id=${testimony.authorUid}`}>
            {authorName}
          </Internal>
        ) : (
          authorName
        )}
      </div>
    )
  }
)
