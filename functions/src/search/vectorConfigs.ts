import type { VectorIndexerConfig } from "./createVectorIndexer"

// Shared by the vector-index triggers and the embedding backfill script, so
// both embed the same text and record the same hash.

export const billVectorConfig: VectorIndexerConfig = {
  documentTrigger: "generalCourts/{court}/bills/{id}",
  textFields: ["content.Title", "content.DocumentText"],
  vectorField: "vector_embedding",
  titleField: "content.Title"
}

export const testimonyVectorConfig: VectorIndexerConfig = {
  documentTrigger: "users/{uid}/publishedTestimony/{id}",
  textFields: ["content"],
  vectorField: "vector_embedding",
  titleField: "billTitle"
}

export const ballotQuestionVectorConfig: VectorIndexerConfig = {
  documentTrigger: "ballotQuestions/{id}",
  textFields: ["title", "description", "fullSummary"],
  vectorField: "vector_embedding",
  titleField: "title"
}
