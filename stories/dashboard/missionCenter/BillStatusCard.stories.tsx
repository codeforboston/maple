import { createMeta } from "stories/utils"
import { BillStatusCard } from "components/BillStatusCard/BillStatusCard"
import { ComponentStory } from "@storybook/react"

export default createMeta({
  title: "Dashboard/Mission Center/BillStatusCard",
  figmaUrl:
    "https://www.figma.com/file/3ifz37EOwDfmnEG8320KlD/CS1---MAPLE?node-id=231%3A13623",
  component: BillStatusCard
})

const Template: ComponentStory<typeof BillStatusCard> = props => {
  return <BillStatusCard {...props} />
}

export const Primary = Template.bind({})
Primary.args = {
  bill: {
    history: [
      {
        date: "01/01",
        branch: "house",
        action: "House checked with e l and L"
      },
      { date: "01/01", branch: "house", action: "someone entered the house" },
      { date: "01/01", branch: "house", action: "someone entered the house" },
      { date: "01/01", branch: "house", action: "someone entered the house" },
      { date: "01/01", branch: "house", action: "someone entered the house" }
    ]
  }
}

export const SingularHistory = Template.bind({})
SingularHistory.args = {
  bill: {
    history: [
      {
        date: "01/01",
        branch: "house",
        action: "House checked with e l and L"
      }
    ]
  }
}
