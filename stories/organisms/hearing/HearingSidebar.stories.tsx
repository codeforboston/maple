import { Meta, StoryObj } from "@storybook/react"
import { HearingSidebar } from "components/hearing/HearingSidebar"

const meta: Meta<typeof HearingSidebar> = {
  title: "Organisms/Hearing/HearingSidebar",
  component: HearingSidebar
}

export default meta

type Story = StoryObj<typeof HearingSidebar>

export const Default: Story = {
  args: {
    activeVideo: 0,
    billsInAgenda: [
      { id: "H.1234", title: "An Act promoting clean energy" },
      { id: "S.5678", title: "An Act regarding transportation funding" }
    ],
    committeeCode: "J_TT",
    generalCourtNumber: "194",
    hearingDate: "2026-04-20T14:00:00",
    transcripts: null
  }
}

export const NoDate: Story = {
  args: {
    ...Default.args,
    hearingDate: null
  }
}

export const Empty: Story = {
  args: {
    activeVideo: 0,
    billsInAgenda: null,
    committeeCode: null,
    generalCourtNumber: null,
    hearingDate: null,
    transcripts: null
  }
}
