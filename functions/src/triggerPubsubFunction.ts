import { PubSub } from "@google-cloud/pubsub"
import { onRequest as onRequestV2 } from "firebase-functions/v2/https"
import type { ScheduleFunction } from "firebase-functions/v2/scheduler"
import type { Request, Response } from "express"

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
  const triggerPubsubFunctionHandler = async (
    request: Request,
    response: Response
  ): Promise<void> => {
    let topic: string
    if (request.query.scheduled) {
      // V2 onSchedule functions expect an HTTP request from Cloud Scheduler, so
      // publishing to their schedule topic crashes them. Run the handler directly.
      const name = request.query.scheduled as string
      const fns: Record<string, unknown> = await import("./index")
      const fn = fns[name] as ScheduleFunction | undefined
      if (typeof fn?.run !== "function") {
        response
          .status(404)
          .set("Access-Control-Allow-Origin", "*")
          .send(`Error: No scheduled function named ${name}\n`)
        return
      }
      await fn.run({ scheduleTime: new Date().toISOString() })
      response
        .status(200)
        .set("Access-Control-Allow-Origin", "*")
        .send(`Ran ${name}\n`)
      return
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

  exports.triggerPubsubFunction = onRequestV2(triggerPubsubFunctionHandler)
}
