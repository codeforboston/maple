export type PublishMode = "bill" | "ballotQuestion"

export const getPublishMode = (ballotQuestionId?: string): PublishMode =>
  ballotQuestionId ? "ballotQuestion" : "bill"

export const isBallotQuestionMode = (ballotQuestionId?: string) =>
  getPublishMode(ballotQuestionId) === "ballotQuestion"
