import type { Meta, StoryObj } from "@storybook/react"
import { Timestamp } from "firebase/firestore"
import { NewsfeedCard } from "components/NewsfeedCard/NewsfeedCard"

const meta: Meta<typeof NewsfeedCard> = {
  title: "Organisms/Newsfeed/NewsfeedCard",
  component: NewsfeedCard
}

export default meta

type Story = StoryObj<typeof NewsfeedCard>

const timestamp = Timestamp.fromDate(new Date("2026-04-10T15:20:00"))

export const BillUpdate: Story = {
  args: {
    type: "bill",
    header: "An Act creating a clean energy bank",
    subheader: "Reporting date extended",
    billId: "H3340",
    court: "194",
    bodyText:
      "The reporting date was extended to Thursday June 30, 2026, pending concurrence.",
    timestamp,
    isBillMatch: true
  }
}

export const TestimonyUpdate: Story = {
  args: {
    type: "testimony",
    header: "An Act relative to housing stability",
    subheader: "MAPLE Housing Coalition",
    authorUid: "org-123",
    billId: "S2100",
    court: "194",
    bodyText:
      "Stable housing is foundational to public health, education, and economic security.",
    position: "endorse",
    testimonyId: "testimony-123",
    timestamp,
    userRole: "organization",
    isBillMatch: true,
    isUserMatch: true
  }
}

export const BallotQuestionUpdate: Story = {
  args: {
    type: "ballotQuestion",
    header: "Question 2: Worker Benefits and Independent Contractor Standards",
    ballotQuestionId: "25-12",
    ballotStatus: "accepted",
    bodyText:
      "The ballot question status changed after review by the Attorney General.",
    timestamp,
    isBallotQuestionMatch: true
  }
}
