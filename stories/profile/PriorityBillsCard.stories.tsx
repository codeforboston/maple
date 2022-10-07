import React from "react"
import { createMeta } from "stories/utils"
import { PriorityBillsCard } from "../../components/PriortyBillsCard/PriorityBillsCard"

//const PriorityBillsCard = () => <div>TODO</div>

export default createMeta({
  title: "Profile/PriorityBillsCard",
  figmaUrl:
    "https://www.figma.com/file/3ifz37EOwDfmnEG8320KlD/CS1---MAPLE?node-id=109%3A2927",
  component: PriorityBillsCard
})
// const args = {
//   id: '123',
//   title: '123-UH',
//   description: "My baby don't mess around because she loves me so and this I know fo sho (uh) but does she really wanna but can't stand to see me walk out the door? (Ah)",
// }

const Template = args => <PriorityBillsCard {...args} />

export const Primary = Template.bind({})
Primary.args = {
  bills: [
    {
      id: "123",
      title: "hc 223",
      description:
        "An act that will which would have wonder with have done wrought it so orth here we go!",

      approval: "y"
    },
    {
      id: "123",
      title: "hc 223",
      description:
        "An act that will which would have wonder with have done wrought it so orth here we go!",

      approval: "y"
    },
    {
      id: "123",
      title: "hc 223",
      description:
        "An act that will which would have wonder with have done wrought it so orth here we go!",

      approval: "y"
    }
  ]
}
