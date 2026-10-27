import { createVectorIndexer } from "../search/createVectorIndexer"
import { ballotQuestionVectorConfig } from "../search/vectorConfigs"

export const syncBallotQuestionToVectorIndex = createVectorIndexer(
  ballotQuestionVectorConfig
)
