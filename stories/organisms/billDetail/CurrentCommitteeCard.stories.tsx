import { Meta, StoryObj } from "@storybook/react"
import { CurrentCommitteeCard } from "components/CurrentCommitteeCard/CurrentCommitteeCard"

const meta: Meta = {
  title: "Organisms/Bill Detail/CurrentCommitteeCard",
  component: CurrentCommitteeCard
}

export default meta

type Story = StoryObj<typeof CurrentCommitteeCard>
export const Primary: Story = {
  args: { chamber: "House", committee: "Committee of Ways and Means" },
  name: "CurrentCommitteeCard"
}
