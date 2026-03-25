export type Hearing = {
  id: string
  videoURL?: string
  content: {
    startsAt: string | number | Date
  }
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
