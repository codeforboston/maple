/** What a testimony is addressed to: a ballot question, a committee of
 * conference, or (with neither) the bill alone. Import-free so the website can
 * share it. */
export type TestimonyScope = {
  ballotQuestionId?: string | null
  conferenceId?: string | null
}

/** Whether a testimony belongs to the scope. Matched in memory rather than by
 * query, since documents written before a scope field existed lack it and
 * Firestore cannot select on a missing field. */
export function matchesTestimonyScope(
  testimony: TestimonyScope | undefined,
  scope: TestimonyScope = {}
) {
  return (
    (testimony?.ballotQuestionId || null) ===
      (scope.ballotQuestionId || null) &&
    (testimony?.conferenceId || null) === (scope.conferenceId || null)
  )
}
