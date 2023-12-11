import { ComponentStory, Meta, StoryObj } from "@storybook/react"
import { createMeta } from "stories/utils"
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
    billName: "H.3330"
  }
}

export const MultipleItems = Template.bind({})
MultipleItems.args = {
  items: [
    <ListItem
      key={1}
      billName="H.3330"
      billDescription="Important bill, must vote!"
    />,
    <ListItem
      key={2}
      billName="H.3330"
      billDescription="Important bill, must vote!"
    />,
    <ListItem
      key={3}
      billName="H.3330"
      billDescription="Important bill, must vote!"
    />
  ]
}
