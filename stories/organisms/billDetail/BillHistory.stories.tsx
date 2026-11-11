import { Meta, StoryObj } from "@storybook/react"
import { HistoryTable } from "components/bill/HistoryTable"
import { CourtContext } from "components/bill/Status"

const meta: Meta<typeof HistoryTable> = {
  title: "Organisms/Bill Detail/BillHistory",
  component: HistoryTable,
  decorators: [
    Story => (
      <CourtContext.Provider value={194}>
        <Story />
      </CourtContext.Provider>
    )
  ]
}

export default meta

type Story = StoryObj<typeof HistoryTable>

export const HearingUpdates: Story = {
  args: {
    billHistory: [
      {
        Date: "2025-11-25T00:00:00",
        Branch: "Joint",
        Action:
          'Hearing rescheduled to 11/25/2025 from 10:00 AM-04:00 PM in A-2 and Virtual<br> <span style="color: blue; font-style: italic;">Hearing updated to New End Time</span>'
      },
      {
        Date: "2025-11-26T00:00:00",
        Branch: "House",
        Action: "Accompanied a new draft, see <span>H2021</span> and S42"
      },
      {
        Date: null,
        Branch: "House",
        Action: "Referred to Ways &amp; Means"
      }
    ]
  }
}
