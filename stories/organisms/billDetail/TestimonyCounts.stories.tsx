import { ComponentStory } from "@storybook/react"
import { createMeta } from "stories/utils"
import { TestimonyCounts } from "components/bill/TestimonyCounts"
import { BillProps } from "components/bill/types"

export default createMeta({
  title: "Organisms/Bill Detail/TestimonyCounts",
  figmaUrl:
    "https://www.figma.com/file/3ifz37EOwDfmnEG8320KlD/CS1---MAPLE?node-id=49%3A3010",
  component: TestimonyCounts
})

const Template: ComponentStory<typeof TestimonyCounts> = args => (
  <TestimonyCounts {...args} />
)

export const Primary = Template.bind({})

Primary.args = {
  bill: {
    testimonyCount: 23,
    neutralCount: 12,
    endorseCount: 14,
    opposeCount: 2
  }
} as Partial<BillProps>
