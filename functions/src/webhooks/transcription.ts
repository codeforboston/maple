import * as functions from "firebase-functions"
import { AssemblyAI } from "assemblyai"
import { db } from "../firebase"
import { sha256 } from "js-sha256"

const assembly = new AssemblyAI({
  apiKey: process.env.ASSEMBLY_API_KEY ? process.env.ASSEMBLY_API_KEY : ""
})

export const transcription = functions.https.onRequest(async (req, res) => {
  console.log("req.headers", req.headers)
  if (req.headers["x-maple-webhook"]) {
    console.log("req.body.status", req.body.status)

    if (req.body.status === "completed") {
      const transcript = await assembly.transcripts.get(req.body.transcript_id)
      console.log("transcript.webhook_auth", transcript.webhook_auth)
      if (transcript && transcript.webhook_auth) {
        const maybeEventInDb = await db
          .collection("events")
          .where("videoAssemblyId", "==", transcript.id)
          .get()
        console.log("maybeEventInDb.docs.length", maybeEventInDb.docs.length)
        if (maybeEventInDb.docs.length) {
          const authenticatedEventsInDb = maybeEventInDb.docs.filter(
            async e => {
              const hashedToken = sha256(String(req.headers["x-maple-webhook"]))

              const tokenInDb = await db
                .collection("events")
                .doc(e.id)
                .collection("private")
                .doc("webhookAuth")
                .get()
              const tokenInDbData = tokenInDb.data()
              console.log("tokenInDbData", tokenInDbData)

              if (tokenInDbData) {
                return hashedToken === tokenInDbData.videoAssemblyWebhookToken
              }
              return false
            }
          )
          console.log("authenticatedEventsInDb", authenticatedEventsInDb)

          if (authenticatedEventsInDb) {
            try {
              await db
                .collection("transcriptions")
                .doc(transcript.id)
                .set({ _timestamp: new Date(), ...transcript })

              authenticatedEventsInDb.forEach(async d => {
                await d.ref.update({
                  ["x-maple-webhook"]: null
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
