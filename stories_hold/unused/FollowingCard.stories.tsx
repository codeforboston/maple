import { ComponentStory } from "@storybook/react"
import { createMeta } from "stories/utils"
import { FollowingCard } from "components/FollowingCard/FollowingCard"

export default createMeta({
  title: "Dashboard/Side Panels/FollowingCard",
  component: FollowingCard
})

const Template: ComponentStory<typeof FollowingCard> = args => (
  <FollowingCard {...args} />
)

export const Primary = Template.bind({})

const organizations = [
  {
    name: "Moms for Liberty",
    href: "https://www.google.com",
    iconSrc: "bostoncollegeicon.png"
  },
  {
    name: "Moms for Boston",
    href: "https://www.google.com",
    iconSrc: "berkmankleincentericon.png"
  },
  {
    name: "Moms for Sober Driving",
    href: "https://www.google.com",
    iconSrc: "bostoncollegeicon.png"
  },
  {
    name: "Fathers for Liberty",
    href: "https://www.google.com",
    iconSrc: "bostoncollegeicon.png"
  },
  {
    name: "Boston College",
    href: "https://www.google.com",
    iconSrc: "bostoncollegeicon.png"
  },
  {
    name: "Green Sustainability",
    href: "https://www.google.com",
    iconSrc: "bostoncollegeicon.png"
  },
  {
    name: "Boston Fire Department Unit",
    href: "https://www.google.com",
    iconSrc: "bostoncollegeicon.png"
  },
  {
    name: "Parents Defending Education",
    href: "https://www.google.com",
    iconSrc: "bostoncollegeicon.png"
  },
  {
    name: "Turning Point USA",
    href: "https://www.google.com",
    iconSrc: "bostoncollegeicon.png"
  }
]

Primary.args = { organizations }
