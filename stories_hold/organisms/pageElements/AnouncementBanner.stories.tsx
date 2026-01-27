import { StoryObj } from "@storybook/react"
import AnouncementBanner from "components/AnnouncementBanner/AnouncementBanner.tsx"
import { createMeta } from "stories/utils"

export default createMeta({
  title: "components/AnnouncementBanner",
  component: AnouncementBanner
})

type Story = StoryObj<typeof AnouncementBanner>

export const Primary: Story = {
  args: {
    endDate: new Date("2026-03-01T12:00:00.000Z")
  },
  name: "AnnouncementBanner"
}
