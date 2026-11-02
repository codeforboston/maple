import { createVectorIndexer } from "../search/createVectorIndexer"
import { testimonyVectorConfig } from "../search/vectorConfigs"

export const syncTestimonyToVectorIndex = createVectorIndexer(
  testimonyVectorConfig
)
