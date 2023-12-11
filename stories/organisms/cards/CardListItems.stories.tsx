import { Meta, StoryObj } from "@storybook/react"
import { CardListItems, ListItem } from "components/Card"
import { Primary as PrimaryListItem } from './CardListItem.stories'


const meta: Meta = {
  title: "Organisms/Cards/CardListItem",
  component: CardListItems
}

export default meta

type Story = StoryObj<typeof CardListItems>




export const Primary: Story = {
  args: {
    items: [
      <ListItem key={2} {...PrimaryListItem.args} />,
      <ListItem
        key={1}
        billName="H.3330"
        billDescription="Important bill, must vote!"
        element={undefined}
      />
    ]
  }
}

export const OnlyBillName = Template.bind({})
OnlyBillName.args = {
  items: [<ListItem billName="H.3330" />]
}

export const MultipleItems = Template.bind({})
MultipleItems.args = {
  items: [
    <ListItem billName="H.3330" billDescription="Important bill, must vote!" />,
    <ListItem billName="H.3330" billDescription="Important bill, must vote!" />,
    <ListItem billName="H.3330" billDescription="Important bill, must vote!" />
  ]
}
