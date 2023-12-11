import { ComponentStory, Meta, StoryObj } from "@storybook/react"
import BasicsOfTestimonyCard from "components/LearnTestimonyComponents/BasicsOfTestimony/BasicsOfTestimonyCard"
import React from "react"
import { createMeta } from "stories/utils"

const meta: Meta = {
  title: "Organisms/Education/BasicsOfTestimonyCard",
  component: BasicsOfTestimonyCard,
  parameters: {
    backgrounds: { name: "medium", value: "#f4f4f4" }
  }
}
export default meta

type Story = StoryObj<typeof BasicsOfTestimonyCard>

export const Primary: Story = {


  args: {
    title: "Anyone can submit testimony to the MA legislature",
    paragraph:
      "Legislators tend to value testimony most when it comes from their own constituents. Testimony from MA residents is typically directed to both the committee that is substantively responsible for the bill as well as the legislators (House member and Senator) representing your district.",
    src: "who.svg",
    alt: "Who"
  },

  name: "BasicsOfTestimonyCard"
}