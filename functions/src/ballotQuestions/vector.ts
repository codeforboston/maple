import { createVectorIndexer } from "../search/createVectorIndexer";

export const syncBallotQuestionToVectorIndex = createVectorIndexer({
  documentTrigger: "ballotQuestions/{id}",
  textFields: ["title", "description", "fullSummary"],
  vectorField: "vector_embedding",
  titleField: "title"
});
