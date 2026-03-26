export type Hearing = {
  id: string
  videoURL?: string
  startsAt: number // milliseconds since epoch, converted from Firestore Timestamp server-side
}

export type BallotQuestionTab =
  | "overview"
  | "testimonies"
  | "synthesis"
  | "for_against"
  | "news"
  | "academia"
  | "financials"
  | "map"

export type BallotQuestionTestimonySummary = {
  testimonyCount: number
  endorseCount: number
  neutralCount: number
  opposeCount: number
}
