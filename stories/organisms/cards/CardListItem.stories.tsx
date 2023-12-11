import { Meta, StoryObj } from "@storybook/react"
import { ListItem } from "components/Card"

const meta: Meta = {

  title: "Organisms/Cards/CardListItem",
  component: ListItem
}

export default meta

type Story = StoryObj<typeof ListItem>


export const Primary: Story = {
  args: {
    billName: "H.3330",
    billDescription: "Important bill, must vote!",
    element: undefined
  }
}

export const OnlyBillName: Story = {
  args: {
    billName: "H.3330",
    billDescription: "Important bill, must vote!",
    element: undefined
  }
}
