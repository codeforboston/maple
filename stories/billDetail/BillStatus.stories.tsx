import { ComponentStory } from "@storybook/react"
import { createMeta } from "stories/utils"
import BillStatus, { Stage } from "components/bill/BillStatus"

export default createMeta({
  title: "Bill Detail/BillStatus",
  figmaUrl:
    "https://www.figma.com/file/3ifz37EOwDfmnEG8320KlD/CS1---MAPLE?node-id=249%3A18636",
  component: BillStatus
})

const Template: ComponentStory<typeof BillStatus> = props => {
  return (
    <div className="d-flex">
      <div className="col">
        <BillStatus {...props} />
      </div>
    </div>
  )
}

export const Primary = Template.bind({})

Primary.args = {
  currentStage: Stage.firstChamber,
  id: "H2346"
}
