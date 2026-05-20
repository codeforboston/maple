import { Meta, StoryObj } from "@storybook/react"
import {
  BrowseBallotQuestions,
  BallotQuestionBrowseItem
} from "components/ballotquestions/BrowseBallotQuestions"

const meta: Meta<typeof BrowseBallotQuestions> = {
  title: "Organisms/BallotQuestions/BrowseBallotQuestions",
  component: BrowseBallotQuestions
}

export default meta

type Story = StoryObj<typeof BrowseBallotQuestions>

const sampleItems: BallotQuestionBrowseItem[] = [
  {
    id: "1",
    title: "Question 1: Ranked-Choice Voting",
    fullSummary:
      "This initiative would allow voters to rank candidates in order of preference for certain state and federal elections.",
    electionYear: 2026,
    court: 194,
    ballotStatus: "expectedOnBallot",
    ballotQuestionNumber: 1,
    endorseCount: 42,
    neutralCount: 5,
    opposeCount: 12
  },
  {
    id: "2",
    title: "Question 2: Minimum Wage Increase",
    fullSummary:
      "This initiative would gradually raise the state minimum wage to $20 per hour by 2027.",
    electionYear: 2026,
    court: 194,
    ballotStatus: "accepted",
    ballotQuestionNumber: 2,
    endorseCount: 88,
    neutralCount: 10,
    opposeCount: 30
  },
  {
    id: "3",
    title: "Question 3: Dental Insurance Mandate",
    fullSummary:
      "This initiative would require health insurance plans to include dental coverage.",
    electionYear: 2024,
    court: 193,
    ballotStatus: "rejected",
    ballotQuestionNumber: 3,
    endorseCount: 15,
    neutralCount: 8,
    opposeCount: 60
  },
  {
    id: "4",
    title: "Question 4: Transportation Funding",
    fullSummary:
      "This initiative would dedicate a portion of income tax revenue to public transportation improvements.",
    electionYear: 2024,
    court: 193,
    ballotStatus: "failedToAppear",
    ballotQuestionNumber: null,
    endorseCount: 5,
    neutralCount: 2,
    opposeCount: 3
  }
]

export const Default: Story = {
  args: {
    items: sampleItems,
    currentYear: 2026
  }
}

export const Empty: Story = {
  args: {
    items: [],
    currentYear: 2026
  }
}

export const SingleStatus: Story = {
  args: {
    items: sampleItems.filter(i => i.ballotStatus === "expectedOnBallot"),
    currentYear: 2026
  }
}
