import { ComponentStory } from "@storybook/react"
import { createMeta } from "stories/utils"
import CommunicatingWithLegislators from "../../components/CommunicatingWithLegislators/CommunicatingWithLegislators"
export default createMeta({
  title: "Education/CommunicatingWithLegislators",
  figmaUrl:
    "https://www.figma.com/file/3ifz37EOwDfmnEG8320KlD/CS1---MAPLE?node-id=49%3A3010",
  component: CommunicatingWithLegislators
})

const Template: ComponentStory<typeof CommunicatingWithLegislators> = () => (
  <CommunicatingWithLegislators />
)

export const Primary = Template.bind({})
