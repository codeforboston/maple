import { ComponentStory } from "@storybook/react"
import React, { useState } from "react"
import { createMeta } from "stories/utils"
import { HotBillCard } from "components/HotBillCard/HotBillCard"

// TODO: move into components directory
//const HotBillCard = () => <div>TODO</div>

export default createMeta({
  title: "Dashboard/Newsfeed/HotBillCard",
  figmaUrl:
    "https://www.figma.com/file/3ifz37EOwDfmnEG8320KlD/CS1---MAPLE?node-id=158%3A3865",
  component: HotBillCard
})

const Template: ComponentStory<typeof HotBillCard> = props => {
  const [selectedBillId, setSelectedBillId] = useState("")

  const onBillSelected = (billNumber: string) => {
    console.log("onBillSelected", billNumber)
    setSelectedBillId(billNumber)
  }

  props.selectedBillId = selectedBillId

  return <HotBillCard {...props} />
}

export const Primary = Template.bind({})
Primary.args = {
  bills: [
    {
      id: "123",
      billNumber: "hc.508",
      title:
        "An Act that goes by no other name but... I forget. But it was good",
      endorseCount: 41,
      opposeCount: 182,
      neutralCount: 98
    },
    {
      id: "456",
      billNumber: "hc.411",
      title:
        "An Act that goes by no other name but... I forget. But it was good",
      endorseCount: 41,
      opposeCount: 182,
      neutralCount: 98
    },
    {
      id: "789",
      billNumber: "hc.999",
      title:
        "An Act that goes by no other name but... I forget. But it was good",
      endorseCount: 41,
      opposeCount: 182,
      neutralCount: 98
    },
    {
      id: "012",
      billNumber: "hc.911",
      title:
        "An Act that goes by no other name but... I forget. But it was good",
      endorseCount: 41,
      opposeCount: 182,
      neutralCount: 98
    },
    {
      id: "345",
      billNumber: "hc.888",
      title:
        "An Act that goes by no other name but... I forget. But it was good",
      endorseCount: 41,
      opposeCount: 182,
      neutralCount: 98
    }
  ],
  session: "123"
}
