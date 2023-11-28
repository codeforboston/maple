import { ComponentStory } from "@storybook/react"
import { createMeta } from "stories/utils"
import { CurrentCommitteeCard } from "components/CurrentCommitteeCard/CurrentCommitteeCard"

export default createMeta({
  title: "Bill Detail/CurrentCommitteeCard",
  figmaUrl:
    "https://www.figma.com/file/3ifz37EOwDfmnEG8320KlD/CS1---MAPLE?node-id=159%3A4939",
  component: CurrentCommitteeCard
})

const Template: ComponentStory<typeof CurrentCommitteeCard> = args => (
  <CurrentCommitteeCard {...args} />
)

export const Primary = Template.bind({})
Primary.args = { chamber: "House", committee: "Committee of Ways and Means" }
