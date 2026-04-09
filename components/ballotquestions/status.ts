import { BallotQuestion } from "../db"

type BallotQuestionStatus = BallotQuestion["ballotStatus"]

export const isActiveBallotQuestionPhase = (status: BallotQuestionStatus) =>
  ["qualifying", "certified", "ballot", "expectedOnBallot"].includes(status)

export const isTerminalBallotQuestionPhase = (status: BallotQuestionStatus) =>
  [
    "enacted",
    "failed",
    "withdrawn",
    "failedToAppear",
    "rejected",
    "accepted"
  ].includes(status)

export const getBallotQuestionStatusLabel = (status: BallotQuestionStatus) => {
  switch (status) {
    case "legislature":
      return "Before the legislature"
    case "qualifying":
      return "Qualifying"
    case "certified":
      return "Certified"
    case "ballot":
      return "On the ballot"
    case "enacted":
      return "Enacted"
    case "failed":
      return "Failed"
    case "withdrawn":
      return "Withdrawn"
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
