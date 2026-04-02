import { BallotQuestion } from "../db"

type BallotQuestionStatus = BallotQuestion["ballotStatus"]

export const isActiveBallotQuestionPhase = (status: BallotQuestionStatus) =>
  ["qualifying", "certified", "ballot"].includes(status)

export const isTerminalBallotQuestionPhase = (status: BallotQuestionStatus) =>
  ["enacted", "failed", "withdrawn"].includes(status)

export const getBallotQuestionStatusLabel = (status: BallotQuestionStatus) => {
  switch (status) {
    case "legislature":
      return "Legislature"
    case "qualifying":
      return "Qualifying"
    case "certified":
      return "Certified"
    case "ballot":
      return "On Ballot"
    case "enacted":
      return "Enacted"
    case "failed":
      return "Failed"
    case "withdrawn":
      return "Withdrawn"
  }
}
