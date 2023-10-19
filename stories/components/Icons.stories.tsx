import {
  OrgIconLarge,
  OrgIconSmall,
  UserIconLarge,
  UserIconSmall
} from "components/ProfilePage/StyledProfileComponents"
import React from "react"
import { createMeta } from "stories/utils"

const IconStories = ({ children }: { children: React.ReactNode }) => {
  return <div>{children}</div>
}

export default createMeta({
  title: "Components/Icons",
  component: IconStories
})

export const Primary = () => {
  return (
    <IconStories>
      <UserIconLarge />
      <UserIconSmall />
      <OrgIconLarge />
      <OrgIconSmall />
    </IconStories>
  )
}
Primary.storyName = "Icons"