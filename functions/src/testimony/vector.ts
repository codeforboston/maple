import { createVectorIndexer } from "../search/createVectorIndexer";

export const syncTestimonyToVectorIndex = createVectorIndexer({
  documentTrigger: "users/{uid}/publishedTestimony/{id}",
  textFields: ["content"],
  vectorField: "vector_embedding",
  titleField: "billTitle"
});
