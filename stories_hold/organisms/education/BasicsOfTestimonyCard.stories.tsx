import { ComponentStory } from "@storybook/react"
import BasicsOfTestimonyCard from "components/LearnTestimonyComponents/BasicsOfTestimony/BasicsOfTestimonyCard"
import React from "react"
import { createMeta } from "stories/utils"

export default createMeta({
  title: "Organisms/Education/BasicsOfTestimonyCard",
  component: BasicsOfTestimonyCard,
  parameters: {
    backgrounds: { name: "medium", value: "#f4f4f4" }
  }
})

const Template: ComponentStory<typeof BasicsOfTestimonyCard> = args => (
  <BasicsOfTestimonyCard {...args} />
)

export const Primary = Template.bind({})

Primary.args = {
  title: "Anyone can submit testimony to the MA legislature",
  paragraph:
    "Legislators tend to value testimony most when it comes from their own constituents. Testimony from MA residents is typically directed to both the committee that is substantively responsible for the bill as well as the legislators (House member and Senator) representing your district.",
  src: "who.svg",
  alt: "Who"
}

Primary.storyName = "BasicsOfTestimonyCard"
