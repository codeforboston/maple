import { FieldValue, Timestamp } from "../../functions/src/firebase"
import { Record, Number } from "runtypes"
import { Script } from "./types"

const Args = Record({
  eventId: Number.optional()
})

function migrateVideo(
  data: FirebaseFirestore.DocumentData
): FirebaseFirestore.DocumentData | null {
  if ('videos' in data) {
    return null;
  }

  if (!('videoURL' in data)) {
    return {
      videos: [],
      transcriptionIds: [],
      videoTranscriptionId: FieldValue.delete(),
      videoFetchedAt: FieldValue.delete(),
      videoURL: FieldValue.delete(),
    };
  }

  const url = data.videoURL;
  const fetchedAt = data?.videoFetchedAt;
  const transcriptionId = data?.videoTranscriptionId;

  if (!fetchedAt) {
    throw new Error(
      `If videoURL is present for the video, it is expected that videoFetchedAt is also present (id: ${data.id})`
    );
  }

  const transcriptionIds = transcriptionId ? [transcriptionId] : [];

  const videos = [
    {
      // Default; not shown
      title: data.id,
      url,
      transcriptionId,
      fetchedAt,
    },
  ];

  return {
    videos,
    transcriptionIds,
    videosFetchedAt: fetchedAt || Timestamp.now(),
    videoTranscriptionId: FieldValue.delete(),
    videoFetchedAt: FieldValue.delete(),
    videoURL: FieldValue.delete(),
  };
}

export const script: Script = async ({ db, args }) => {
  const { eventId } = Args.check(args)

  // Process a single event by eventId
  if (eventId) {
    const snapshot = await db
      .collection("events")
      .where("type", "==", "hearing")
      .where("id", "==", eventId)
      .get()
    
    if (snapshot.empty || snapshot.docs.length !== 1) {
      throw new Error(`The number of documents matching the event id ${eventId} must be exactly one`)
    }
    
    const doc = snapshot.docs[0]
    const modify = migrateVideo(doc.data())
    if (modify) {
      doc.ref.update(modify)
    }
  } else {
    const snapshot = await db
      .collection("events")
      .where("type", "==", "hearing")
      .get();

    if (snapshot.empty) {
      throw new Error("Hearing backfill failed; no documents were found");
    }

    let bulkWriter = db.bulkWriter();

    for (const doc of snapshot.docs) {
      console.log(doc.data().id)
      const modify = migrateVideo(doc.data())
      if (modify) {
        // syncHearingToSearchIndex will temporarily complain due to the multiple updates of bulkWriter
        bulkWriter.update(doc.ref, modify)
      }
    }
    await bulkWriter.close();
  }

  console.log("Video backfill complete")
}
