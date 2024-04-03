import { Meta, StoryObj } from "@storybook/react"
import { EventCard } from "components/HearingsScheduled"

const meta: Meta = {
  title: "Organisms/Cards/EventCard",
  component: EventCard
}

export default meta

type Story = StoryObj<typeof EventCard>

export const Primary: Story = {
  args: {
    type: "hearing",
    name: "Rabbit Season",
    id: 4909,
    location: "Written Testimony Only",
    month: "Apr",
    date: "5",
    day: "Friday",
    time: "2:00 PM"
  }
}
