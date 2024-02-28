import { ComponentStory } from "@storybook/react"
import { createMeta } from "stories/utils"
import CommunicatingWithLegislators from "components/CommunicatingWithLegislators/CommunicatingWithLegislators"
export default createMeta({
  title: "Pages/Education/CommunicatingWithLegislators",
  component: CommunicatingWithLegislators
})

const Template: ComponentStory<typeof CommunicatingWithLegislators> = () => (
  <CommunicatingWithLegislators />
)

export const Primary = Template.bind({})

Primary.storyName = "CommunicatingWithLegislators"
