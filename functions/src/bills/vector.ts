import { createVectorIndexer } from "../search/createVectorIndexer"

export const syncBillToVectorIndex = createVectorIndexer({
  documentTrigger: "generalCourts/{court}/bills/{id}",
  textFields: ["content.Title", "content.DocumentText"],
  vectorField: "vector_embedding",
  titleField: "content.Title"
})
