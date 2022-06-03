import { runWith } from "firebase-functions"
import { CollectionConfig, registerConfig } from "./config"
import { SearchIndexer } from "./SearchIndexer"

export function createSearchIndexer(config: CollectionConfig) {
  registerConfig(config)
  return {
    upgradeSearchIndex: runWith({
      timeoutSeconds: 240,
      secrets: ["TYPESENSE_API_KEY"]
    })
      .firestore.document(SearchIndexer.upgradePath(config.alias))
      .onCreate(async () => {
        await new SearchIndexer(config).performUpgrade()
      }),
    syncToSearchIndex: runWith({
      timeoutSeconds: 30,
      secrets: ["TYPESENSE_API_KEY"]
    })
      .firestore.document(`${config.sourceCollection.path}/{id}`)
      .onWrite(async change => {
        await new SearchIndexer(config).syncDocument(change)
      })
  }
}
