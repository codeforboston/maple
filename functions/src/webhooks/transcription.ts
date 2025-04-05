import * as functions from "firebase-functions"
import { AssemblyAI } from "assemblyai"
import { db } from "../firebase"
import { sha256 } from "js-sha256"

const assembly = new AssemblyAI({
  apiKey: process.env.ASSEMBLY_API_KEY ? process.env.ASSEMBLY_API_KEY : ""
})

export const transcription = functions.https.onRequest(async (req, res) => {
  if (req.headers["x-maple-webhook"]) {
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

          const { id, text, audio_url, utterances, words } = transcript
          if (authenticatedEventsInDb) {
            try {
              const transcriptionInDb = db
                .collection("transcriptions")
                .doc(transcript.id)

              transcriptionInDb.set({
                id,
                text,
                timestamp: new Date(),
                audio_url,
                words
              })

              transcriptionInDb
                .collection("timestamps")
                .doc("utterances")
                .set({
                  utterances: utterances?.map(
                    ({ speaker, confidence, start, end, text }) => ({
                      speaker,
                      confidence,
                      start,
                      end,
                      text
                    })
                  )
                })

              transcriptionInDb.collection("timestamps").doc("words").set({
                words
              })

              const batch = db.batch()

              batch.set(db.collection("transcriptions").doc(transcript.id), {
                _timestamp: new Date(),
                ...transcript
              })

              authenticatedEventsInDb.forEach(doc => {
                batch.update(doc.ref, { ["x-maple-webhook"]: null })
              })

              await batch.commit()

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
