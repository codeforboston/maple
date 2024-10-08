import { onMessagePublished } from "firebase-functions/v2/pubsub"
import { getRegisteredConfigs } from "./config"
import { SearchIndexer } from "./SearchIndexer"

/** Schedules index upgrades for each config if necessary. Requires a message
 * with content `{ "check": true}` */
export const checkSearchIndexVersion = onMessagePublished(
  {
    topic: "checkSearchIndexVersion",
    secrets: ["TYPESENSE_API_KEY"]
  },
  async (message: any) => {
    if (message.json.check !== true)
      throw Error('Expected { "check": true } message')
    for (const config of getRegisteredConfigs()) {
      await new SearchIndexer(config).scheduleUpgradeIfNeeded(message.json)
    }
  }
)
