import { Meta, StoryObj } from "@storybook/react"
import { CardListItems, ListItem } from "components/Card"
import { OnlyBillName } from "./CardListItem.stories"

const meta: Meta = {
  title: "Organisms/Cards/CardListItems",
  component: CardListItems
}

export default meta

type Story = StoryObj<typeof CardListItems>

export const Primary: Story = {
  render: args => (
    <CardListItems items={[<ListItem {...OnlyBillName.args} billName="" />]} />
  )
}

export const MultipleItems: Story = {
  args: {
    items: [
      <ListItem
        billName="H.3330"
        billDescription="Important bill, must vote!"
      />,
      <ListItem
        billName="H.3330"
        billDescription="Important bill, must vote!"
      />,
      <ListItem
        billName="H.3330"
        billDescription="Important bill, must vote!"
      />
    ]
  }
}
