import { onRequest } from "firebase-functions/v2/https"

//import { runWith } from "firebase-functions"
import { BaseRecord, CollectionConfig, registerConfig } from "./config"
import { SearchIndexer } from "./SearchIndexer"

export function createSearchIndexer<T extends BaseRecord = BaseRecord>(
  config: CollectionConfig<T>
) {
  registerConfig(config)
  return {
    // upgradeSearchIndex: runWith({
    upgradeSearchIndex: onRequest(
      {
        timeoutSeconds: 240,
        secrets: ["TYPESENSE_API_KEY"]
      },
      (req, res) => {
        res.status(200).send("Hello world!")
      }
    )
      .firestore.document(SearchIndexer.upgradePath(config.alias))
      .onCreate(async (snap: any) => {
        await new SearchIndexer(config).performUpgrade(snap.data())
      }),
    // syncToSearchIndex: runWith({
    syncToSearchIndex: onRequest(
      {
        timeoutSeconds: 30,
        secrets: ["TYPESENSE_API_KEY"]
      },
      (req, res) => {
        res.status(200).send("Hello world!")
      }
    )
      .firestore.document(config.documentTrigger)
      .onWrite(async (change: any) => {
        await new SearchIndexer(config).syncDocument(change)
      })
  }
}
