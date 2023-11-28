import { ComponentStory } from "@storybook/react"
import { BillTrackerView } from "components/bill/BillTracker"
import { Timestamp } from "firebase/firestore"
import { Stage } from "functions/src/analysis/types"
import { createMeta } from "stories/utils"

export default createMeta({
  title: "Bill Detail/BillStatus",
  figmaUrl:
    "https://www.figma.com/file/3ifz37EOwDfmnEG8320KlD/CS1---MAPLE?node-id=249%3A18636",
  component: BillTrackerView
})

const Template: ComponentStory<typeof BillTrackerView> = props => (
  <BillTrackerView {...props} className="col-4" />
)

export const Primary = Template.bind({})
export const Secondary = Template.bind({})

Primary.args = {
  tracker: {
    id: "123",
    court: 193,
    label: {
      status: Stage.billIntroduced,
      attribution: "House",
      createdAt: Timestamp.now()
    },
    prediction: {
      status: Stage.secondCommittee,
      version: 2,
      createdAt: Timestamp.now()
    }
  }
}

Secondary.args = {
  tracker: {
    id: "123",
    court: 193,
    label: {
      status: Stage.secondCommittee,
      attribution: "House",
      createdAt: Timestamp.now()
    },
    prediction: {
      status: Stage.secondCommittee,
      version: 2,
      createdAt: Timestamp.now()
    }
  }
}
