import { Record, String } from "runtypes"
import { Script } from "./types"

const Args = Record({
  eventId: String.optional()
})

export function reformatFactory(fn: (data: FirebaseFirestore.DocumentData) => any) {
  return async ({ db, args }: { db: FirebaseFirestore.Firestore, args: any }) => {
    const { eventId } = Args.check(args)

    // Process a single event by eventId
    if (eventId) {
      const snapshot = await db
        .collection("events")
        .where("type", "==", "hearing")
        .where("id", "==", eventId)
        .get()

      if (snapshot.empty || snapshot.docs.length !== 1) {
        throw new Error(
          `The number of documents matching the event id ${eventId} must be exactly one`
        )
      }

      const doc = snapshot.docs[0]
      const modify = fn(doc.data())
      if (modify) {
        await doc.ref.update(modify)
      }
    } else {
      const snapshot = await db
        .collection("events")
        .where("type", "==", "hearing")
        .get()

      if (snapshot.empty) {
        throw new Error("Hearing backfill failed; no documents were found")
      }

      let bulkWriter = db.bulkWriter()

      for (const doc of snapshot.docs) {
        console.log(doc.data().id)
        const modify = fn(doc.data())
        if (modify) {
          bulkWriter.update(doc.ref, modify)
        }
      }
      await bulkWriter.close()
    }

    console.log("Video backfill complete")
  }
}

function getVideoFormatUpdate(
  data: FirebaseFirestore.DocumentData
): any {
  if ("videos" in data || !("videoURL" in data)) {
    return {}
  }

  const url = data.videoURL
  const fetchedAt = data.videoFetchedAt
  const transcriptionId = data.videoTranscriptionId

  if (!url || !fetchedAt || !transcriptionId) {
    throw new Error(`In the data for ${data.id}, it is expected that if videoURL exists videoFetchedAt and videoTranscriptionId also exist`)
  }

  const transcriptionIds = [transcriptionId]

  const videos = [
    {
      // Default; not shown
      title: data.id,
      url,
      transcriptionId
    }
  ]

  return {
    videos,
    transcriptionIds,
    videosFetchedAt: fetchedAt,
  }
}

export const script: Script = reformatFactory(getVideoFormatUpdate)
