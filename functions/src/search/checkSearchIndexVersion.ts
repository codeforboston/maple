import { runWith } from "firebase-functions"
import { getRegisteredConfigs } from "./config"
import { SearchIndexer } from "./SearchIndexer"

/** Schedules index upgrades for each config if necessary. Requires a message
 * wtih content `{ "check": true}` */
export const checkSearchIndexVersion = runWith({
  secrets: ["TYPESENSE_API_KEY"]
})
  .pubsub.topic("checkSearchIndexVersion")
  .onPublish(async message => {
    if (message.json.check !== true)
      throw Error('Expected { "check": true } message')
    for (const config of getRegisteredConfigs()) {
      await new SearchIndexer(config).scheduleUpgradeIfNeeded(message.json)
    }
  })
