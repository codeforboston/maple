import { BallotQuestion } from "../db"

type BallotQuestionStatus = BallotQuestion["ballotStatus"]

export const isActiveBallotQuestionPhase = (status: BallotQuestionStatus) =>
  ["qualifying", "certified", "ballot"].includes(status)

export const isTerminalBallotQuestionPhase = (status: BallotQuestionStatus) =>
  ["enacted", "failed", "withdrawn"].includes(status)
