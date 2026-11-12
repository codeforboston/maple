import { createVectorIndexer } from "../search/createVectorIndexer"
import { billVectorConfig } from "../search/vectorConfigs"

export const syncBillToVectorIndex = createVectorIndexer(billVectorConfig)
