import { createClient } from "./client"
import { onSchedule } from "firebase-functions/v2/scheduler"

const connectionTimeoutSeconds = 5,
  numRetries = 2,
  functionTimeoutSeconds = 30

/** Checks that the search backend is working. If this fails it will trigger an
 * alert. */
// export const searchHealthCheck = runWith(
export const searchHealthCheck = onSchedule(
  {
    schedule: "every 30 minutes",
    secrets: ["TYPESENSE_API_KEY"],
    timeoutSeconds: functionTimeoutSeconds,
    memory: "128MiB",
    retryCount: 0
  },
  async request => {
    const client = createClient({
      connectionTimeoutSeconds,
      numRetries
    })
    const res = await client.health.retrieve()
    if (!res.ok)
      throw Error(
        `Search backend responded with failure: ${JSON.stringify(res)}`
      )
  }
)
