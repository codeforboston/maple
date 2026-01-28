import { StoryObj } from "@storybook/react"
import AnnouncementBanner from "components/AnnouncementBanner/AnnouncementBanner"
import { createMeta } from "stories/utils"

export default createMeta({
  title: "components/AnnouncementBanner",
  component: AnnouncementBanner
})

type Story = StoryObj<typeof AnnouncementBanner>

export const Primary: Story = {
  args: {
    endDate: new Date("2026-03-01T12:00:00.000Z")
  },
  name: "AnnouncementBanner"
}
