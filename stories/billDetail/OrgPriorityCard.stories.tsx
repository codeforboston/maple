import { ComponentStory } from "@storybook/react"
import { createMeta } from "stories/utils"
import { OrgPriorityCard } from "./OrgPriorityCard"

export default createMeta({
  title: "Bill Detail/OrgPriorityCard",
  figmaUrl:
    "https://www.figma.com/file/3ifz37EOwDfmnEG8320KlD/CS1---MAPLE?node-id=242%3A16629",
  component: OrgPriorityCard
})

const Template: ComponentStory<typeof OrgPriorityCard> = args => (
  <OrgPriorityCard {...args} />
)

const orgs2 = [
  {
    id: "qewhtfb001",
    name: "Moms for Liberty",
    orgImageSrc: "/MFL.png",
    stanceTitle: "neutral"
  },
  {
    id: "qewhtfb002",
    name: "Boston Fire Department Union",
    orgImageSrc: "/BFD.png",
    stanceTitle: "endorse"
  },
  {
    id: "qewhtfb003",
    name: "Parents Defending Education",
    orgImageSrc: "/PDE.png",
    stanceTitle: "reject"
  },
  {
    id: "qewhtfb004",
    name: "Boston Fire Department Union",
    orgImageSrc: "/BFD.png",
    stanceTitle: "endorse"
  }
]

const orgs3 = [
  {
    id: "qewhtfb001",
    name: "Moms for Liberty",
    orgImageSrc: "/MFL.png",
    stanceTitle: "neutral"
  },
  {
    id: "qewhtfb002",
    name: "Boston Fire Department Union",
    orgImageSrc: "/BFD.png",
    stanceTitle: "endorse"
  },
  {
    id: "qewhtfb003",
    name: "Parents Defending Education",
    orgImageSrc: "/PDE.png",
    stanceTitle: "reject"
  },
  {
    id: "qewhtfb004",
    name: "Boston Fire Department Union",
    orgImageSrc: "/BFD.png",
    stanceTitle: "endorse"
  },
  {
    id: "qewhtfb005",
    name: "Moms for Liberty",
    orgImageSrc: "/MFL.png",
    stanceTitle: "neutral"
  },
  {
    id: "qewhtfb006",
    name: "Boston Fire Department Union",
    orgImageSrc: "/BFD.png",
    stanceTitle: "endorse"
  },
  {
    id: "qewhtfb007",
    name: "Parents Defending Education",
    orgImageSrc: "/PDE.png",
    stanceTitle: "reject"
  },
  {
    id: "qewhtfb008",
    name: "Boston Fire Department Union",
    orgImageSrc: "/BFD.png",
    stanceTitle: "endorse"
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
