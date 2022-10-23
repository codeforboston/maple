import { convertNumericRefinementsToFilters } from "instantsearch.js/es/lib/utils"
import React, { useState } from "react"
import { createMeta } from "stories/utils"
import { PriorityBillsCard } from "../../components/PriortyBillsCard/PriorityBillsCard"
import { ComponentStory } from "@storybook/react"

//const PriorityBillsCard = () => <div>TODO</div>
//const [isATheCLickyMe, setIsATheClickyMe] = useState()

export default createMeta({
  title: "Profile/PriorityBillsCard",
  figmaUrl:
    "https://www.figma.com/file/3ifz37EOwDfmnEG8320KlD/CS1---MAPLE?node-id=109%3A2927",
  component: PriorityBillsCard
})

const Template: ComponentStory<typeof PriorityBillsCard> = props => {
  const [selectedBillId, setSelectedBillId] = useState("hc.508")
  const HandleCLick = () => {
    for (let i = 0; i < props.bills.length; i++) {
      if (props.bills[i].billNumber === selectedBillId) {
        setSelectedBillId(
          i + 1 >= props.bills.length
            ? props.bills[0].billNumber
            : props.bills[i + 1].billNumber
        )
        break
      }
    }
  }
  props.onClick = HandleCLick
  props.selectedBillId = selectedBillId
  return <PriorityBillsCard {...props} />
}

export const Primary = Template.bind({})
Primary.args = {
  bills: [
    {
      id: "123",
      billNumber: "hc.508",
      title:
        "An Act that goes by no other name but... I forget. But it was good",

      approval: "y"
    },
    {
      id: "456",
      billNumber: "hc.411",
      title:
        "An Act that goes by no other name but... I forget. But it was good",

      approval: "y"
    },
    {
      id: "789",
      billNumber: "hc.999",
      title:
        "An Act that goes by no other name but... I forget. But it was good",

      approval: "y"
    },
    {
      id: "012",
      billNumber: "hc.911",
      title:
        "An Act that goes by no other name but... I forget. But it was good",

      approval: "y"
    },
    {
      id: "345",
      billNumber: "hc.888",
      title:
        "An Act that goes by no other name but... I forget. But it was good",

      approval: "y"
    }
  ],
  session: "123"
}
