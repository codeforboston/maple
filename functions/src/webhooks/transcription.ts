import * as functions from "firebase-functions"
import { AssemblyAI } from "assemblyai"
import { db, Timestamp } from "../firebase"
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

              if (tokenInDbData) {
                return hashedToken === tokenInDbData.videoAssemblyWebhookToken
              }
              return false
            }
          )

          const { id, text, audio_url, utterances, words } = transcript
          if (authenticatedEventsInDb) {
            try {
              const transcriptionInDb = await db
                .collection("transcriptions")
                .doc(id)

              await transcriptionInDb.set({
                id,
                text,
                createdAt: Timestamp.now(),
                audio_url
              })

              if (utterances) {
                const writer = db.bulkWriter()
                for (let utterance of utterances) {
                  const { speaker, confidence, start, end, text } = utterance

                  writer.set(
                    db.doc(`/transcriptions/${transcript.id}/utterances/`),
                    { speaker, confidence, start, end, text }
                  )
                }

                await writer.close()
              }

              const batch = db.batch()
              authenticatedEventsInDb.forEach(doc => {
                batch.update(doc.ref, { ["x-maple-webhook"]: null })
              })
              await batch.commit()
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
