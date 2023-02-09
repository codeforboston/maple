import { ComponentStory, Meta } from "@storybook/react"
import BillTrackerConnectedView from "components/bill/BillTracker"
import { Status } from "components/bill/Status"
import { BillProps } from "components/bill/types"
import { Timestamp } from "firebase/firestore"
import { Stage } from "functions/src/analysis/types"
import { createMeta } from "stories/utils"

export default createMeta({
  title: "Bill Detail/BillStatus",
  figmaUrl:
    "https://www.figma.com/file/3ifz37EOwDfmnEG8320KlD/CS1---MAPLE?node-id=249%3A18636",
  component: BillTrackerConnectedView
})

const Template: ComponentStory<typeof BillTrackerConnectedView> = props => {
  return (
    <div className="d-flex">
      <div className="col">
        <BillTrackerConnectedView {...props} />
      </div>
    </div>
  )
}

export const Primary = Template.bind({})

Primary.args = {
  bill: { id: "H4002" }
} as Partial<BillProps>
