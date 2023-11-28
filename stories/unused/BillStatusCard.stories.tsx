import { ComponentStory } from "@storybook/react"
import { BillStatusCard } from "components/BillStatusCard/BillStatusCard"
import { createMeta } from "stories/utils"

export default createMeta({
  title: "Unused/BillStatusCard",
  figmaUrl:
    "https://www.figma.com/file/Uyh2NXGTCX60mkse2NVBH7/MAPLE?node-id=2184%3A23094&t=yQ7oQ6AqkJc2pZNR-4",
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
        branch: "HOUSE",
        action: "House checked with the l and L for Nunito"
      },
      { date: "01/02", branch: "HOUSE", action: "someone entered the house" },
      { date: "01/03", branch: "JOINT", action: "someone entered the house" },
      { date: "01/04", branch: "HOUSE", action: "someone entered the house" },
      { date: "01/05", branch: "SENATE", action: "someone entered the house" },
      { date: "01/02", branch: "HOUSE", action: "someone entered the house" },
      { date: "01/03", branch: "JOINT", action: "someone entered the house" },
      { date: "01/04", branch: "HOUSE", action: "someone entered the house" },
      { date: "01/05", branch: "SENATE", action: "someone entered the house" },
      { date: "01/02", branch: "HOUSE", action: "someone entered the house" },
      { date: "01/03", branch: "JOINT", action: "someone entered the house" },
      { date: "01/04", branch: "HOUSE", action: "someone entered the house" },
      { date: "01/05", branch: "SENATE", action: "someone entered the house" }
    ]
  }
}

export const SingularHistory = Template.bind({})
SingularHistory.args = {
  bill: {
    history: [
      {
        date: "01/01",
        branch: "HOUSE",
        action: "House checked with the l and L for Nunito"
      }
    ]
  }
}
