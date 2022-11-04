import { ComponentStory } from "@storybook/react"
import React, { useState } from "react"
import { createMeta } from "stories/utils"
import { PriorityBillsCard } from "../../components/PriortyBillsCard/PriorityBillsCard"

//const PriorityBillsCard = () => <div>TODO</div>
//const [isATheCLickyMe, setIsATheClickyMe] = useState()

export default createMeta({
  title: "Profile/PriorityBillsCard",
  figmaUrl:
    "https://www.figma.com/file/3ifz37EOwDfmnEG8320KlD/CS1---MAPLE?node-id=109%3A2927",
  component: PriorityBillsCard
})

const Template: ComponentStory<typeof PriorityBillsCard> = props => {
  const [selectedBillId, setSelectedBillId] = useState("")

  const onBillSelected = (billNumber: string) => {
    console.log("onBillSelected", billNumber)
    setSelectedBillId(billNumber)
  }

  props.onClick = (string: string) => onBillSelected(string)
  props.selectedBillId = selectedBillId

  console.log("rerender", props)
  return <PriorityBillsCard {...props} />
}

export const Primary = Template.bind({})
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
  session: "123"
}
