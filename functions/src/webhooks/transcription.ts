import * as functions from "firebase-functions"
import { AssemblyAI } from "assemblyai"
import { db } from "../firebase"
import { sha256 } from "js-sha256"

const assembly = new AssemblyAI({
  apiKey: process.env.ASSEMBLY_API_KEY ? process.env.ASSEMBLY_API_KEY : ""
})

export const transcription = functions.https.onRequest(async (req, res) => {
  if (
    req.headers["X-Maple-Webhook"] &&
    req.headers["webhook_auth_header_value"]
  ) {
    if (req.body.status === "completed") {
      const transcript = await assembly.transcripts.get(req.body.transcript_id)
      if (transcript && transcript.webhook_auth) {
        const maybeEventInDb = await db
          .collection("events")
          .where("videoAssemblyId", "==", transcript.id)
          .get()
        if (maybeEventInDb.docs.length) {
          const authenticatedEventsInDb = maybeEventInDb.docs.filter(
            async e => {
              const hashedToken = sha256(
                String(req.headers["webhook_auth_header_value"])
              )

              const tokenInDb = await db
                .collection("events")
                .doc(e.id)
                .collection("private")
                .doc("webhookAuth")
                .get()
              const tokenInDbData = tokenInDb.data()
              if (tokenInDbData) {
                return hashedToken === tokenInDbData.videoAssemblyWebhookToken
              }
              return false
            }
          )
          if (authenticatedEventsInDb) {
            try {
              await db
                .collection("transcriptions")
                .doc(transcript.id)
                .set({ _timestamp: new Date(), ...transcript })

              authenticatedEventsInDb.forEach(async d => {
                await d.ref.update({
                  ["webhook_auth_header_value"]: null
                })
              })
              console.log("transcript saved in db")
            } catch (error) {
              console.log(error)
            }
          }
        } else {
          res.status(404).send("Not Found")
        }
      }
    }
  }
  res.status(200).send()
})
