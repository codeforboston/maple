import { Testimony } from "./types"

export function matchesBallotQuestionScope(
  testimony: Pick<Testimony, "ballotQuestionId"> | undefined,
  ballotQuestionId?: string
) {
  const value = testimony?.ballotQuestionId ?? undefined
  return ballotQuestionId ? value === ballotQuestionId : !value
}
