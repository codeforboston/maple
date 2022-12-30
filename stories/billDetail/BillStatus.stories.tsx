import { ComponentStory, Meta } from "@storybook/react"
import BillStatusView from "components/bill/BillStatus"
import { createMeta } from "stories/utils"

export default createMeta({
  title: "Bill Detail/BillStatus",
  figmaUrl:
    "https://www.figma.com/file/3ifz37EOwDfmnEG8320KlD/CS1---MAPLE?node-id=249%3A18636",
  component: BillStatusView})


const Template: ComponentStory<typeof BillStatusView> = props => {
  return (
    <div className="d-flex">
      <div className="col">
        <BillStatusView {...props} />
      </div>
    </div>
  )
}

export const Primary = Template.bind({})

Primary.args = {
  id: "S2729"
}