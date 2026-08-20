import { BallotQuestion } from "../db"

type BallotQuestionStatus = BallotQuestion["ballotStatus"]

export const isActiveBallotQuestionPhase = (status: BallotQuestionStatus) =>
  ["expectedOnBallot"].includes(status)

export const isTerminalBallotQuestionPhase = (status: BallotQuestionStatus) =>
  ["failedToAppear", "rejected", "accepted"].includes(status)

export const getBallotQuestionStatusLabel = (status: BallotQuestionStatus) => {
  switch (status) {
    case "expectedOnBallot":
      return "Expected on ballot"
    case "failedToAppear":
      return "Failed to appear on ballot"
    case "rejected":
      return "Rejected"
    case "accepted":
      return "Accepted"
  }
}
