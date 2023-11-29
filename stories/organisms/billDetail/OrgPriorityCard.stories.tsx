import { ComponentStory } from "@storybook/react"
import { createMeta } from "stories/utils"
import { OrgItem, OrgPriorityCard } from "./OrgPriorityCard"

export default createMeta({
  title: "Organisms/Bill Detail/OrgPriorityCard",
  figmaUrl:
    "https://www.figma.com/file/3ifz37EOwDfmnEG8320KlD/CS1---MAPLE?node-id=242%3A16629",
  component: OrgPriorityCard
})

const Template: ComponentStory<typeof OrgPriorityCard> = args => (
  <OrgPriorityCard {...args} />
)

const orgs2: OrgItem[] = [
  {
    id: "qewhtfb001",
    name: "Moms for Liberty",
    orgImageSrc: "/MFL.png",
    position: "neutral"
  },
  {
    id: "qewhtfb002",
    name: "Boston Fire Department Union",
    orgImageSrc: "/BFD.png",
    position: "endorse"
  },
  {
    id: "qewhtfb003",
    name: "Parents Defending Education",
    orgImageSrc: "/PDE.png",
    position: "oppose"
  },
  {
    id: "qewhtfb004",
    name: "Boston Fire Department Union",
    orgImageSrc: "/BFD.png",
    position: "endorse"
  }
]

const orgs3: OrgItem[] = [
  {
    id: "qewhtfb001",
    name: "Moms for Liberty",
    orgImageSrc: "/MFL.png",
    position: "neutral"
  },
  {
    id: "qewhtfb002",
    name: "Boston Fire Department Union",
    orgImageSrc: "/BFD.png",
    position: "endorse"
  },
  {
    id: "qewhtfb003",
    name: "Parents Defending Education",
    orgImageSrc: "/PDE.png",
    position: "oppose"
  },
  {
    id: "qewhtfb004",
    name: "Boston Fire Department Union",
    orgImageSrc: "/BFD.png",
    position: "endorse"
  },
  {
    id: "qewhtfb005",
    name: "Moms for Liberty",
    orgImageSrc: "/MFL.png",
    position: "neutral"
  },
  {
    id: "qewhtfb006",
    name: "Boston Fire Department Union",
    orgImageSrc: "/BFD.png",
    position: "endorse"
  },
  {
    id: "qewhtfb007",
    name: "Parents Defending Education",
    orgImageSrc: "/PDE.png",
    position: "oppose"
  }
]

export const Primary = Template.bind({})
Primary.args = {
  header: "Organisation Prioritizing this Bill",
  subheader: "Prioritizing Bill H.3340",
  orgs: orgs2
}

export const Secondary = Template.bind({})
Secondary.args = {
  header: "Organisation Prioritizing this Bill",
  subheader: "Prioritizing Bill H.3340",
  orgs: orgs3
}
