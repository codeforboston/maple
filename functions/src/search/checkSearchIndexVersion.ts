import { runWith } from "firebase-functions"
import { createClient } from "./client"
import { getRegisteredConfigs } from "./config"
import { SearchIndexer } from "./SearchIndexer"
import { upsertLegislativeSynonyms } from "./synonyms"

/** Schedules index upgrades for each config/alias(bills/hearing/testimony) if necessary. Requires a message
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
    // After the upgrades are scheduled, so a failure here cannot lose a
    // reindex; a throw still fails the invocation and shows up in monitoring.
    const synonyms = await upsertLegislativeSynonyms(createClient())
    console.log(
      `Upserted synonym set "${synonyms.name}" with ${synonyms.items} items`
    )
  })
