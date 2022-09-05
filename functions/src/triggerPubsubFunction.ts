import { PubSub } from "@google-cloud/pubsub"
import * as functions from "firebase-functions"

const projectId = process.env.GCLOUD_PROJECT
const pubsubClient = new PubSub({ projectId })

if (process.env.FUNCTIONS_EMULATOR === "true") {
  /**
   * Exposes an endpoint that triggers a particular scheduled cloud function. Firebase emulators do not handle scheduled triggers, so this provides an easy means of testing the system.
   *
   * `curl http://localhost:5001/demo-dtp/us-central1/triggerPubsubFunction?scheduled=startDocumentBatches`
   * `curl --get --data-urlencode 'data={"check":true}' --data-urlencode 'pubsub=checkSearchIndexVersion' http://localhost:5001/demo-dtp/us-central1/triggerPubsubFunction`
   *
   * See https://github.com/firebase/firebase-tools/issues/2034#issuecomment-845351980
   */
  exports.triggerPubsubFunction = functions.https.onRequest(
    async (request, response) => {
      let topic: string
      if (request.query.scheduled) {
        topic = `projects/${projectId}/topics/firebase-schedule-${request.query.scheduled}`
      } else if (request.query.pubsub) {
        topic = `projects/${projectId}/topics/${request.query.pubsub}`
      } else {
        response
          .status(400)
          .set("Access-Control-Allow-Origin", "*")
          .send(
            "Error: Include `scheduled` query parameter for scheduled triggers or `pubsub` for pubsub triggers.\n"
          )
        return
      }

      const data = (request.query.data as string) ?? "trigger"
      const publisher = pubsubClient.topic(topic).publisher
      await publisher.publishMessage({ data: Buffer.from(data) })
      response
        .status(200)
        .set("Access-Control-Allow-Origin", "*")
        .send("Fired PubSub\n")
    }
  )
}
