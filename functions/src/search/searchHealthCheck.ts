import { onRequest } from "firebase-functions/v2/https"

// import { runWith } from "firebase-functions"
import { createClient } from "./client"

const connectionTimeoutSeconds = 5,
  numRetries = 2,
  functionTimeoutSeconds = 30

/** Checks that the search backend is working. If this fails it will trigger an
 * alert. */
// export const searchHealthCheck = runWith(
export const searchHealthCheck = onRequest(
  {
    secrets: ["TYPESENSE_API_KEY"],
    timeoutSeconds: functionTimeoutSeconds,
    memory: "128MB"
  },
  (req, res) => {
    res.status(200).send("Hello world!")
  }
)
  .pubsub.schedule("every 30 minutes")
  .retryConfig({
    // Retry using the client
    retryCount: 0
  })
  .onRun(async () => {
    const client = createClient({
      connectionTimeoutSeconds,
      numRetries
    })
    const res = await client.health.retrieve()
    if (!res.ok)
      throw Error(
        `Search backend responded with failure: ${JSON.stringify(res)}`
      )
  })
