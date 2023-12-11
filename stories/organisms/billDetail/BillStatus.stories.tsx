import { ComponentStory, Meta, StoryObj } from "@storybook/react"
import { BillTrackerView } from "components/bill/BillTracker"
import { Timestamp } from "firebase/firestore"
import { Stage } from "functions/src/analysis/types"
import { createMeta } from "stories/utils"

const meta: Meta = {
  title: "Organisms/Bill Detail/BillStatus",
  component: BillTrackerView
}

export default meta

type Story = StoryObj<typeof BillTrackerView>

export const Primary: Story = {
  storyName: "Cosponsors",
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
  },
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
  storyName: "In Second Committee"
}
