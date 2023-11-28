import { createMeta } from "stories/utils"
import { OrgAvatar } from "./OrgAvatar"
import { ComponentStory } from "@storybook/react"

export default createMeta({
  title: "Unused/Avatar",
  figmaUrl:
    "https://www.figma.com/file/3ifz37EOwDfmnEG8320KlD/CS1---MAPLE?node-id=242%3A16634",
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
