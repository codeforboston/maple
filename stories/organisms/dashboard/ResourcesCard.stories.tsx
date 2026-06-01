import { Meta, StoryObj } from "@storybook/react"
import { ResourcesCard } from "components/dashboard/ResourcesCard"

const meta: Meta<typeof ResourcesCard> = {
  title: "Organisms/Dashboard/ResourcesCard",
  component: ResourcesCard
}

export default meta

type Story = StoryObj<typeof ResourcesCard>

export const Default: Story = {}
