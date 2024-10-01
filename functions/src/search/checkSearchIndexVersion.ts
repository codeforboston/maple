import { onRequest } from "firebase-functions/v2/https"

// import { runWith } from "firebase-functions"
import { getRegisteredConfigs } from "./config"
import { SearchIndexer } from "./SearchIndexer"

/** Schedules index upgrades for each config if necessary. Requires a message
 * wtih content `{ "check": true}` */
// export const checkSearchIndexVersion = runWith({
export const checkSearchIndexVersion = onRequest(
  {
    secrets: ["TYPESENSE_API_KEY"]
  },
  (req, res) => {
    res.status(200).send("Hello world!")
  }
)
  .pubsub.topic("checkSearchIndexVersion")
  .onPublish(async (message: any) => {
    if (message.json.check !== true)
      throw Error('Expected { "check": true } message')
    for (const config of getRegisteredConfigs()) {
      await new SearchIndexer(config).scheduleUpgradeIfNeeded(message.json)
    }
  })
