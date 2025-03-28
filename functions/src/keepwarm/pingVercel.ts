import axios from "axios"
import * as functions from "firebase-functions"

/**
 * Pings Vercel every 5 minutes to keep the serverless functions warm.
 *
 * We need this to avoid painful cold starts for users
 * when loading bill/testimony details in the app.
 *
 * Vercel only keeps a function warm for 10 minutes by default,
 * so pinging the site every 5 minutes should keep it warm indefinitely.
 *
 * There are options we can configure in Vercel so we don't
 * need this hacky workaround, but this should suffice until
 * we regain access to the Vercel dashboard.
 *
 * TODO: Remove this once we've updated our Vercel config
 */

export const pingVercel = functions.pubsub
  .schedule("every 5 minutes")
  .onRun(async () => {
    // We can use the same court/bill on both environments
    // because the source data is the same
    const urlToPing = `${process.env.APP_URL_BASE}/bills/194/H868`
    console.log(`Pinging ${urlToPing}...`)

    try {
      const start = Date.now()
      const response = await axios.get(urlToPing, {
        timeout: 30_000
      })
      const end = Date.now()

      console.log(`Ping successful: ${response.status} - Took ${end - start}ms`)
    } catch (e) {
      console.error("Ping failed:", e)
    }
  })
