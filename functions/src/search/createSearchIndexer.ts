import { BaseRecord, CollectionConfig, registerConfig } from "./config"
import { SearchIndexer } from "./SearchIndexer"
import {
  onDocumentCreated,
  onDocumentWritten
} from "firebase-functions/v2/firestore"

export function createSearchIndexer<T extends BaseRecord = BaseRecord>(
  config: CollectionConfig<T>
) {
  registerConfig(config)
  return {
    upgradeSearchIndex: onDocumentCreated(
      {
        document: SearchIndexer.upgradePath(config.alias),
        timeoutSeconds: 240,
        secrets: ["TYPESENSE_API_KEY"]
      },
      async event => {
        await new SearchIndexer(config).performUpgrade(event.data)
      }
    ),
    syncToSearchIndex: onDocumentWritten(
      {
        document: config.documentTrigger,
        timeoutSeconds: 30,
        secrets: ["TYPESENSE_API_KEY"]
      },
      async event => {
        const before = event.data?.before!
        const after = event.data?.after!
        await new SearchIndexer(config).syncDocument({ before, after })
      }
    )
  }
}
