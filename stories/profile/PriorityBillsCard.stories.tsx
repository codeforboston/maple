import { ComponentStory } from "@storybook/react"
import React, { useState } from "react"
import { createMeta } from "stories/utils"
import { PriorityBillsCard } from "../../components/PriortyBillsCard/PriorityBillsCard"

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

  return <PriorityBillsCard {...props} />
}

//editBtn: true,
export const Primary = Template.bind({})
Primary.args = {
  bills: [
    {
      id: "123",
      billNumber: "hc.508",
      title:
        "An Act that goes by no other name but... I forget. But it was good",
      stance: "endorse"
    },
    {
      id: "456",
      billNumber: "hc.411",
      title:
        "An Act that goes by no other name but... I forget. But it was good",
      stance: "oppose"
    },
    {
      id: "789",
      billNumber: "hc.999",
      title:
        "An Act that goes by no other name but... I forget. But it was good",
      stance: "neutral"
    },
    {
      id: "012",
      billNumber: "hc.911",
      title:
        "An Act that goes by no other name but... I forget. But it was good",
      stance: "oppose"
    },
    {
      id: "345",
      billNumber: "hc.888",
      title:
        "An Act that goes by no other name but... I forget. But it was good",
      stance: "endorse"
    }
  ],
  session: "123"
}

export const BillsWithoutStances = Template.bind({})
BillsWithoutStances.args = {
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
  session: "124"
}

export const ThreeBillsWithStances = Template.bind({})
ThreeBillsWithStances.args = {
  bills: [
    {
      id: "123",
      billNumber: "hc.508",
      title:
        "An Act that goes by no other name but... I forget. But it was good",
      stance: "endorse"
    },
    {
      id: "456",
      billNumber: "hc.411",
      title:
        "An Act that goes by no other name but... I forget. But it was good",
      stance: "oppose"
    },
    {
      id: "789",
      billNumber: "hc.999",
      title:
        "An Act that goes by no other name but... I forget. But it was good",
      stance: "neutral"
    }
  ],
  session: "123"
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

export const PrimaryAndEditBtn = Template.bind({})
PrimaryAndEditBtn.args = {
  editBtn: true,
  bills: [
    {
      id: "123",
      billNumber: "hc.508",
      title:
        "An Act that goes by no other name but... I forget. But it was good",
      stance: "endorse"
    },
    {
      id: "456",
      billNumber: "hc.411",
      title:
        "An Act that goes by no other name but... I forget. But it was good",
      stance: "oppose"
    },
    {
      id: "789",
      billNumber: "hc.999",
      title:
        "An Act that goes by no other name but... I forget. But it was good",
      stance: "neutral"
    },
    {
      id: "012",
      billNumber: "hc.911",
      title:
        "An Act that goes by no other name but... I forget. But it was good",
      stance: "oppose"
    },
    {
      id: "345",
      billNumber: "hc.888",
      title:
        "An Act that goes by no other name but... I forget. But it was good",
      stance: "endorse"
    }
  ],
  session: "123"
}

export const BillsWithoutStancesAndEditBtn = Template.bind({})
BillsWithoutStancesAndEditBtn.args = {
  editBtn: true,
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
  session: "124"
}

export const ThreeBillsWithStancesAndEditBtn = Template.bind({})
ThreeBillsWithStancesAndEditBtn.args = {
  editBtn: true,
  bills: [
    {
      id: "123",
      billNumber: "hc.508",
      title:
        "An Act that goes by no other name but... I forget. But it was good",
      stance: "endorse"
    },
    {
      id: "456",
      billNumber: "hc.411",
      title:
        "An Act that goes by no other name but... I forget. But it was good",
      stance: "oppose"
    },
    {
      id: "789",
      billNumber: "hc.999",
      title:
        "An Act that goes by no other name but... I forget. But it was good",
      stance: "neutral"
    }
  ],
  session: "123"
}

export const ThreeBillsWithoutStancesAndEditBtn = Template.bind({})
ThreeBillsWithoutStancesAndEditBtn.args = {
  editBtn: true,
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
