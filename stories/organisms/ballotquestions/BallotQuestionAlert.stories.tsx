import { Meta, StoryObj } from "@storybook/react"
import { BallotQuestionAlert } from "components/ballotquestions/BallotQuestionAlert"

const meta: Meta<typeof BallotQuestionAlert> = {
  title: "Organisms/BallotQuestions/BallotQuestionAlert",
  component: BallotQuestionAlert
}

export default meta

type Story = StoryObj<typeof BallotQuestionAlert>

export const LegalChallenge: Story = {
  args: {
    alertFlag:
      "Legal challenge pending. [Read more](https://example.com/legal-challenge).",
    alertTip:
      "This may affect whether the question appears on the ballot or how it is described."
  }
}

export const NoTooltip: Story = {
  args: {
    alertFlag: "Important ballot question update pending."
  }
}
