import * as functions from "firebase-functions"
import { PubSub } from "@google-cloud/pubsub"

const projectId = process.env.GCLOUD_PROJECT
const pubsubClient = new PubSub({ projectId })

if (process.env.FUNCTIONS_EMULATOR === "true") {
  /**
   * Exposes an endpoint that triggers a particular scheduled cloud function. Firebase emulators do not handle scheduled triggers, so this provides an easy means of testing the system.
   *
   * `curl http://localhost:5001/demo-dtp/us-central1/triggerScheduledFunction?name=startDocumentBatches`
   *
   * See https://github.com/firebase/firebase-tools/issues/2034#issuecomment-845351980
   */
  exports.triggerScheduledFunction = functions.https.onRequest(
    async (request, response) => {
      const functionName = request.query.name
      if (!functionName) {
        response.status(400).send("Error: Include `name` query parameter\n")
        return
      }

      const topic = `projects/${projectId}/topics/firebase-schedule-${functionName}`
      const publisher = pubsubClient.topic(topic).publisher
      await publisher.publishMessage({ data: Buffer.from("trigger") })
      response.status(200).send("Fired PubSub\n")
    }
  )
}
