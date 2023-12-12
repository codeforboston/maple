import { createMeta } from "stories/utils"
import { OrgAvatar } from "./OrgAvatar"
import { ComponentStory } from "@storybook/react"

export default createMeta({
  title: "Components/Avatar",
  component: OrgAvatar
})

const Template: ComponentStory<typeof OrgAvatar> = args => (
  <OrgAvatar {...args} />
)

export const AvatarWithTitle = Template.bind({})
AvatarWithTitle.args = {
  name: "Boston Fire Department Union",
  orgImageSrc: "/BFD.png",
  position: "endorse"
}

export const AvatarWithoutTitle = Template.bind({})
AvatarWithoutTitle.args = {
  orgImageSrc: "/BFD.png",
  position: "endorse"
}

export const EndorsedAvatar = Template.bind({})
EndorsedAvatar.args = {
  name: "Boston Fire Department Union",
  orgImageSrc: "/BFD.png",
  position: "endorse"
}

export const RejectedAvatar = Template.bind({})
RejectedAvatar.args = {
  name: "Parents Defending Education",
  orgImageSrc: "/PDE.png",
  position: "neutral"
}

export const NeutralAvatar = Template.bind({})
NeutralAvatar.args = {
  name: "Moms for Liberty",
  orgImageSrc: "/MFL.png",
  position: "neutral"
}
