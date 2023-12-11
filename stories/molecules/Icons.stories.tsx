import { Meta } from "@storybook/react"
import {
  OrgIconLarge,
  OrgIconSmall,
  UserIconLarge,
  UserIconSmall
} from "components/ProfilePage/StyledProfileComponents"
import React from "react"

const IconStories = ({ children }: { children: React.ReactNode }) => {
  return <div>{children}</div>
}

const meta: Meta = {
  title: "Molecules/Icons",
  component: IconStories
}

export const Primary = {

  args: {
    children: (
      <IconStories>
    {/* <UserIconLarge />
    <UserIconSmall />
    <OrgIconLarge />
    <OrgIconSmall /> */}
    <div>TODO</div>
    </IconStories>
      )
    
  }, name: "Icons"
}



export default meta