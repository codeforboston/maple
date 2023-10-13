import { createMeta } from "stories/utils"
import { PriorityBillsCard } from "components/PriortyBillsCard/PriorityBillsCard"
import { ComponentStory } from "@storybook/react"
// TODO: move into components directory
const DashboardPriorityBillsCard = () => <div>TODO</div>

export default createMeta({
  title: "Dashboard/Side Panels/DashboardPriorityBillsCard",
  figmaUrl:
    "https://www.figma.com/file/3ifz37EOwDfmnEG8320KlD/CS1---MAPLE?node-id=231%3A14013",
  component: PriorityBillsCard
})

type PriorityBillsCardProps = React.ComponentProps<typeof PriorityBillsCard>

const Template = (args: PriorityBillsCardProps) => (
  <PriorityBillsCard {...args} />
)

export const Primary: ComponentStory<typeof PriorityBillsCard> = Template.bind({})

Primary.args = {
  bills: [
    {
      id: "123",
      billNumber: "hc.508",
      title:
        "An Act that goes by no other name but... I forget. But it was good"
    },
    {
      id: "456",
      billNumber: "hc.411",
      title:
        "An Act that goes by no other name but... I forget. But it was good"
    },
    {
      id: "789",
      billNumber: "hc.999",
      title:
        "An Act that goes by no other name but... I forget. But it was good"
    },
    {
      id: "012",
      billNumber: "hc.911",
      title:
        "An Act that goes by no other name but... I forget. But it was good"
    },
    {
      id: "345",
      billNumber: "hc.888",
      title:
        "An Act that goes by no other name but... I forget. But it was good"
    }
  ],
  onClick: (string: string) => console.log("onClick", string),
  selectedBillId: "123"
}
