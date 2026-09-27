import { logger, runWith } from "firebase-functions"
import { GoogleAuth } from "google-auth-library"
import axios from "axios"

// The scraper itself is a standalone Python/Cloud Run job (BeautifulSoup
// parsing, not something a Node Function should do) — this Function only
// triggers it on a schedule, deployed the same way every other scraper's
// schedule is (see functions/src/scraper.ts and sibling *Scraper.ts files).
const JOB_NAME = "maple-lobbying-scraper"
const REGION = "us-central1"

export class LobbyingScraperTrigger {
  private schedule

  constructor(schedule: string = "0 6 * * 1") {
    this.schedule = schedule
  }

  get function() {
    return runWith({ timeoutSeconds: 60, memory: "256MB", maxInstances: 1 })
      .pubsub.schedule(this.schedule)
      .timeZone("Etc/UTC")
      .onRun(() => this.run())
  }

  private async run() {
    const projectId = process.env.GCLOUD_PROJECT
    const url = `https://${REGION}-run.googleapis.com/v2/projects/${projectId}/locations/${REGION}/jobs/${JOB_NAME}:run`

    const auth = new GoogleAuth()
    const client = await auth.getClient()
    const { token } = await client.getAccessToken()

    try {
      await axios.post(
        url,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      logger.info(`Triggered ${JOB_NAME} in ${projectId}`)
    } catch (err) {
      logger.error(`Failed to trigger ${JOB_NAME}`, err)
      throw err
    }
  }
}

export const triggerLobbyingScraper = new LobbyingScraperTrigger().function
