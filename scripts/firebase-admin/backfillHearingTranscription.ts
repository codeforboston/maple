import { Timestamp } from "../../functions/src/firebase"
import { Record, Number } from "runtypes"
import { Script } from "./types"
import { getHearingVideoUrl, submitTranscription } from "functions/src/events"

const Args = Record({
  eventId: Number.optional()
})

export const script: Script = async ({ db, args }) => {
  const { eventId } = Args.check(args)

  // Process a single event by eventId
  if (eventId) {
    const docRef = db.collection("events").doc(`hearing-${eventId}`)
    const doc = await docRef.get()
    if (!doc.exists) {
      console.log(`No hearing found with EventId ${eventId}`)
      return
    }
    const data = doc.data()
    if (data?.videoTranscriptionId) {
      console.log(`Hearing ${eventId} already has a transcription.`)
      return
    }
    try {
      const maybeVideoUrl = await getHearingVideoUrl(eventId)
      if (maybeVideoUrl) {
        const transcriptId = await submitTranscription({
          maybeVideoUrl,
          EventId: eventId
        })

        await docRef.update({
          videoURL: maybeVideoUrl,
          videoFetchedAt: Timestamp.now(),
          videoTranscriptionId: transcriptId
        })

        console.log(
          `Transcription submitted for hearing ${eventId}: ${transcriptId}`
        )
      } else {
        console.log(`No valid video URL found for hearing ${eventId}`)
      }
    } catch (error) {
      console.error(`Failed to process hearing ${eventId}:`, error)
    }
  } else {
    // Bulk process events
    const hearingsSnapshot = await db
      .collection("events")
      .where("type", "==", "hearing")
      .get()

    const writer = db.bulkWriter()
    let count = 0

    for (const doc of hearingsSnapshot.docs) {
      if (count >= 200) {
        break // Limit to 200 operations for this run
      }
      const data = doc.data()
      if (!data.videoTranscriptionId) {
        const EventId = parseInt(doc.id.replace("hearing-", ""))
        console.log(`Processing hearing ${EventId}...`)

        try {
          const maybeVideoUrl = await getHearingVideoUrl(EventId)
          if (maybeVideoUrl) {
            const transcriptId = await submitTranscription({
              maybeVideoUrl,
              EventId
            })

            writer.update(doc.ref, {
              videoURL: maybeVideoUrl,
              videoFetchedAt: Timestamp.now(),
              videoTranscriptionId: transcriptId
            })

            console.log(
              `Transcription submitted for hearing ${EventId}: ${transcriptId}`
            )
            count++
          } else {
            console.log(`No valid video URL found for hearing ${EventId}`)
          }
        } catch (error) {
          console.error(`Failed to process hearing ${EventId}:`, error)
        }
      }
    }
    await writer.close()
    console.log("Done processing hearings without transcriptions.")
  }
}
