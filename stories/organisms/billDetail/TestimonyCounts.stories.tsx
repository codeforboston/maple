import { Meta, StoryObj } from "@storybook/react"
import { TestimonyCounts } from "components/bill/TestimonyCounts"
import { BillProps } from "components/bill/types"

const meta: Meta = {
  title: "Organisms/Bill Detail/TestimonyCounts",
  component: TestimonyCounts
}

export default meta

type Story = StoryObj<typeof TestimonyCounts>


export const Primary = {
  args: {
    bill: {
      testimonyCount: 23,
      neutralCount: 12,
      endorseCount: 14,
      opposeCount: 2
    }
  } as Partial<BillProps>,
  name: "TestimonyCounts"
}
