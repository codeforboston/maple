import { ComponentStory } from "@storybook/react"
import React, { useState } from "react"
import { createMeta } from "stories/utils"
import { PriorityBillsCard } from "../../components/PriortyBillsCard/PriorityBillsCard"

export default createMeta({
  title: "Profile/PriorityBillsCard",
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

  return <PriorityBillsCard {...props} />
}

var stances = ["endorse", "neutral", "oppose"]
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

export const BillsWithStances = Template.bind({})
BillsWithStances.args = {
  ...Primary.args,
  bills: Primary.args.bills?.map(bill => {
    return { ...bill, stance: stances[Math.floor(Math.random() * 3)] }
  })
}

export const ThreeBillsWithoutStances = Template.bind({})
ThreeBillsWithoutStances.args = {
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
    }
  ],
  session: "124"
}

export const ThreeBillsWithStances = Template.bind({})
ThreeBillsWithStances.args = {
  ...ThreeBillsWithoutStances.args,
  bills: ThreeBillsWithoutStances.args.bills?.map(bill => {
    return { ...bill, stance: stances[Math.floor(Math.random() * 3)] }
  })
}
export const PrimaryAndEditBtn = Template.bind({})
PrimaryAndEditBtn.args = {
  ...Primary.args,
  editBtn: true
}

export const WithStancesAndEditBtn = Template.bind({})
WithStancesAndEditBtn.args = {
  ...BillsWithStances.args,
  editBtn: true
}

export const ThreeBillsAndEditBtn = Template.bind({})
ThreeBillsAndEditBtn.args = {
  ...ThreeBillsWithoutStances.args,
  editBtn: true
}

export const ThreeBillsWithStancesAndEditBtn = Template.bind({})
ThreeBillsWithStancesAndEditBtn.args = {
  ...ThreeBillsWithStances.args,
  editBtn: true
}
