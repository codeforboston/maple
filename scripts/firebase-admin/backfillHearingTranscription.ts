import { Record, Number, String } from "runtypes"
import { Script } from "./types"
import { HearingPostProcessor } from "functions/src/events"

const Args = Record({
  eventId: Number.optional(),
  bucketName: String.optional()
})

export const script: Script = async ({ db, args }) => {
  const { eventId, bucketName } = Args.check(args)

  // Process a single event by eventId
  if (eventId) {
    const docRef = db.collection("events").doc(`hearing-${eventId}`)
    const doc = await docRef.get()
    if (!doc.exists) {
      console.log(`No hearing found with EventId ${eventId}`)
      return
    }
    const data = doc.data()
    if (!data) return
    try {
      const update = await new HearingPostProcessor().getUpdate({ EventId: eventId })
      if (update !== null) {
        await docRef.update(update)

        console.log(
          `Transcriptions submitted for hearing ${eventId}: ${update.transcriptionIds}`
        )
      } else {
        console.log(`No additional videos to be processed for ${eventId}`)
      }
    } catch (error) {
      console.error(`Failed to process hearing ${eventId}:`, error)
    }
  } else {
    // Run events sequentially to avoid overloading the transcription service
    const hearingsSnapshot = await db
      .collection("events")
      .where("type", "==", "hearing")
      .get()
    let count = 0

    for (const doc of hearingsSnapshot.docs) {
      if (count >= 100) {
        break // Limit to 100 operations for this run
      }
      const EventId = parseInt(doc.id.replace("hearing-", ""))
      console.log(`Processing hearing ${EventId}...`)
      const data = doc.data()
      if (data.empty) continue

      try {
        const update = await new HearingPostProcessor().getUpdate({ EventId })
        if (update.videos.length > data.videos.length) {
          await doc.ref.update(update)

          console.log(
            `Transcriptions submitted for hearing ${EventId}: ${update.transcriptionIds}`
          )
          count++
        } else {
          console.log(`No additional videos to be processed for hearing ${EventId}`)
        }
      } catch (error) {
        console.error(`Failed to process hearing ${EventId}:`, error)
      }
    }
    console.log("Done processing hearings without transcriptions.")
  }
}
