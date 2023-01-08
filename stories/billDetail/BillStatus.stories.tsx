import { ComponentStory, Meta } from "@storybook/react"
import BillTracker from "components/bill/BillStatus"
import { Status } from "components/bill/Status"
import { Timestamp } from "firebase/firestore"
import { Stage } from "functions/src/analysis/types"
import { createMeta } from "stories/utils"

export default createMeta({
  title: "Bill Detail/BillStatus",
  figmaUrl:
    "https://www.figma.com/file/3ifz37EOwDfmnEG8320KlD/CS1---MAPLE?node-id=249%3A18636",
  component: BillTracker})


const Template: ComponentStory<typeof BillTracker> = props => {
  return (
    <div className="d-flex">
      <div className="col">
        <BillTracker {...props} />
      </div>
    </div>
  )
}

export const Primary = Template.bind({})

Primary.args = {
  tracker: {
    court: 192,
    id: "H666",
    prediction: {
      createdAt: Timestamp.now(),
      status: Stage.firstChamber,
      version: 1
    }
  }
}