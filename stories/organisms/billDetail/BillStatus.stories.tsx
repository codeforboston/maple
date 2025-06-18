import { Meta, StoryObj } from "@storybook/react"
import { BillTrackerView } from "components/bill/BillTracker"
import { Timestamp } from "common/types"
import { Stage } from "functions/src/analysis/types"

const meta: Meta = {
  title: "Organisms/Bill Detail/BillStatus",
  component: BillTrackerView
}

export default meta

type Story = StoryObj<typeof BillTrackerView>

export const Primary: Story = {
  name: "Cosponsors",
  decorators: [(Story, children) => <Story {...children} />],
  args: {
    tracker: {
      id: "123",
      court: 193,
      label: {
        status: Stage.billIntroduced,
        attribution: "House",
        createdAt: Timestamp.now()
      },
      prediction: {
        status: Stage.secondCommittee,
        version: 2,
        createdAt: Timestamp.now()
      }
    }
  }
}

export const Secondary: Story = {
  args: {
    tracker: {
      id: "123",
      court: 193,
      label: {
        status: Stage.secondCommittee,
        attribution: "House",
        createdAt: Timestamp.now()
      },
      prediction: {
        status: Stage.secondCommittee,
        version: 2,
        createdAt: Timestamp.now()
      }
    }
  },
  name: "In Second Committee"
}
