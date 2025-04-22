import * as functions from "firebase-functions"
import { AssemblyAI } from "assemblyai"
import { db, Timestamp } from "../firebase"
import { sha256 } from "js-sha256"

export const transcription = functions
  .runWith({ secrets: ["ASSEMBLY_API_KEY"] })
  .https.onRequest(async (req, res) => {
  if (req.headers["x-maple-webhook"]) {
    if (req.body.status === "completed") {
      // If we get a request with the right header and status, get the
      // transcription from the assembly API.
      const assembly = new AssemblyAI({
        apiKey: process.env.ASSEMBLY_API_KEY ? process.env.ASSEMBLY_API_KEY : ""
      })
      
      const transcript = await assembly.transcripts.get(req.body.transcript_id)
      if (transcript && transcript.webhook_auth) {
        // If there is a transcript and the transcript has an auth property,
        // look for an event (aka Hearing) in the DB with a matching ID.
        const maybeEventsInDb = await db
          .collection("events")
          .where("videoTranscriptionId", "==", transcript.id)
          .get()

        if (maybeEventsInDb.docs.length) {
          // If we have a match look for one that matches a hash of the token
          // we gave Assembly. There should only be one of these but firestore
          // gives us an array. If there is more than one member, something is
          // wrong
          const authenticatedEventIds = [] as string[]
          const hashedToken = sha256(String(req.headers["x-maple-webhook"]))

          for (const index in maybeEventsInDb.docs) {
            const doc = maybeEventsInDb.docs[index]

            const tokenDocInDb = await db
              .collection("events")
              .doc(doc.id)
              .collection("private")
              .doc("webhookAuth")
              .get()

            const tokenDataInDb = tokenDocInDb.data()?.videoAssemblyWebhookToken

            if (hashedToken === tokenDataInDb) {
              authenticatedEventIds.push(doc.id)
            }
          }

          // Log edge cases
          if (maybeEventsInDb.docs.length === 0) {
            console.log("No matching event in db.")
          }
          if (authenticatedEventIds.length === 0) {
            console.log("No authenticated events in db.")
          }
          if (authenticatedEventIds.length > 1) {
            console.log("More than one matching event in db.")
          }

          if (authenticatedEventIds.length === 1) {
            // If there is one authenticated event, pull out the parts we want to
            // save and try to save them in the db.
            const { id, text, audio_url, utterances } = transcript
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

              // Put each `utterance` in a separate doc in an utterances
              // collection. Previously had done the same for `words` but
              // got worried about collection size and write times since
              // `words` can be tens of thousands of members.
              if (utterances) {
                const writer = db.bulkWriter()
                for (let utterance of utterances) {
                  const { speaker, confidence, start, end, text } = utterance

                  writer.set(
                    db
                      .collection("transcriptions")
                      .doc(`${transcript.id}`)
                      .collection("utterances")
                      .doc(),
                    { speaker, confidence, start, end, text }
                  )
                }

                await writer.close()
              }

              // Delete the hashed webhook auth token from our db now that
              // we're done.
              for (const index in authenticatedEventIds) {
                await db
                  .collection("events")
                  .doc(authenticatedEventIds[index])
                  .collection("private")
                  .doc("webhookAuth")
                  .set({
                    videoAssemblyWebhookToken: null
                  })
              }
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
