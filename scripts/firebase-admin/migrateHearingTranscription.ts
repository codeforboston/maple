import * as admin from "firebase-admin"
import { Number, Record, String } from "runtypes"
import { Script } from "./types"
import { Timestamp } from "../../functions/src/firebase"

function getDevServiceAccount(path: string) {
  return require(path)
}

// Initialize source (dev) Firebase
function initDevApp(devServiceAccountPath: string) {
  const devServiceAccount = getDevServiceAccount(devServiceAccountPath)
  return admin.initializeApp(
    {
      credential: admin.credential.cert(devServiceAccount)
    },
    "dev"
  )
}

function convertTimestamps(obj: any): any {
  if (obj instanceof Timestamp) {
    return obj
  } else if (
    obj &&
    typeof obj === "object" &&
    typeof obj._seconds === "number" &&
    typeof obj._nanoseconds === "number"
  ) {
    // Convert plain object to admin Timestamp
    return Timestamp.fromMillis(obj._seconds * 1000 + obj._nanoseconds / 1e6)
  } else if (Array.isArray(obj)) {
    return obj.map(convertTimestamps)
  } else if (obj && typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [k, convertTimestamps(v)])
    )
  }
  return obj
}

async function migrateTranscription(
  db: admin.firestore.Firestore,
  devDb: admin.firestore.Firestore,
  transcriptionId: string,
  bulkWriter?: FirebaseFirestore.BulkWriter
) {
  const devTranscriptionDoc = await devDb
    .collection("transcriptions")
    .doc(transcriptionId)
    .get()

  const devTranscriptionData = devTranscriptionDoc.exists
    ? devTranscriptionDoc.data()
    : null

  if (!devTranscriptionData) {
    throw new Error(
      `Transcription ${transcriptionId} not found in dev project.`
    )
  }

  // Create transcription in target project instead of setting, in case it already exists, which will throw an error
  const convertedData = convertTimestamps(devTranscriptionData)
  console.log(`Creating transcription ${transcriptionId}...`)
  if (bulkWriter) {
    bulkWriter.create(
      db.collection("transcriptions").doc(transcriptionId),
      convertedData
    )
  } else {
    await db
      .collection("transcriptions")
      .doc(transcriptionId)
      .create(convertedData)
  }

  const subcollections = await devTranscriptionDoc.ref.listCollections()
  for (const subcol of subcollections) {
    const docs = await subcol.get()
    for (const doc of docs.docs) {
      const ref = db
        .collection("transcriptions")
        .doc(transcriptionId)
        .collection(subcol.id)
        .doc(doc.id)
      if (bulkWriter) {
        bulkWriter.set(ref, doc.data())
      } else {
        await ref.set(doc.data())
      }
    }
  }
}

async function migrateHearing(
  db: admin.firestore.Firestore,
  devDb: admin.firestore.Firestore,
  devDoc:
    | admin.firestore.DocumentSnapshot<admin.firestore.DocumentData>
    | admin.firestore.QueryDocumentSnapshot<admin.firestore.DocumentData>,
  bulkWriter?: FirebaseFirestore.BulkWriter
): Promise<"migrate" | "skip" | "fail"> {
  const devData = devDoc.data()

  if (!devData || !devData?.transcriptionIds?.length) {
    console.log(`Hearing ${devDoc.id} has no transcription to migrate.`)
    return "skip"
  }
  const targetDoc = await db.collection("events").doc(devDoc.id).get()
  const targetData = targetDoc.exists ? targetDoc.data() : null

  if (!targetData) {
    console.log(`${devDoc.id} not found in target project.`)
    return "skip"
  }

  let found = false
  for (const transcriptionId of devData.transcriptionIds) {
    if (!targetData.transcriptionIds.includes(transcriptionId)) {
      found = true
      try {
        await migrateTranscription(db, devDb, transcriptionId, bulkWriter)
      } catch (err) {
        console.error(`Error creating transcription ${transcriptionId}:`, err)
        return "fail"
      }
    }
  }
  if (!found) {
    console.log(`${devDoc.id} has no new transcriptions.`)
    return "skip"
  }

  console.log(`Updating hearing ${devDoc.id}...`)
  if (bulkWriter) {
    bulkWriter.update(db.collection("events").doc(devDoc.id), {
      videos: devData.videos,
      videosFetchedAt: convertTimestamps(devData.videosFetchedAt),
      transcriptionIds: devData.transcriptionIds
    })
  } else {
    await db
      .collection("events")
      .doc(devDoc.id)
      .update({
        videos: devData.videos,
        videosFetchedAt: convertTimestamps(devData.videosFetchedAt),
        transcriptionIds: devData.transcriptionIds
      })
  }

  return "migrate"
}

const Args = Record({
  sourceProject: String,
  hearing: Number.optional()
})

export const script: Script = async ({ db, args }) => {
  const { sourceProject, hearing } = Args.check(args)
  if (!sourceProject) {
    console.error(
      "Please provide the path to the dev service account JSON file as an argument."
    )
    process.exit(1)
  }

  // Clear emulator environment variables to avoid connecting to emulators when creating secondary instance
  delete process.env.FIRESTORE_EMULATOR_HOST
  delete process.env.FIREBASE_AUTH_EMULATOR_HOST
  delete process.env.FIREBASE_STORAGE_EMULATOR_HOST

  // Initialize dev app and db (digital-testimony-dev)
  const devApp = initDevApp(sourceProject)
  const devDb = devApp.firestore()

  // For single hearing migration
  if (hearing) {
    const hearingId = "hearing-" + hearing
    console.log(`Processing single hearing: ${hearingId}`)
    const devDoc = await devDb.collection("events").doc(hearingId).get()

    if (!devDoc.exists) {
      console.error(`Hearing ${hearingId} not found in dev project.`)
      return
    }

    await migrateHearing(db, devDb, devDoc)
    console.log(`Migration complete for hearing ${hearingId}.`)
  } else {
    // For full migration
    const devHearingsSnapshot = await devDb
      .collection("events")
      .where("type", "==", "hearing")
      .get()

    const limit = 100
    let migrated = 0,
      skipped = 0,
      failed = 0

    const bulkWriter = db.bulkWriter()

    for (const devDoc of devHearingsSnapshot.docs) {
      if (migrated >= limit) {
        console.log(`Migration limit of ${limit} reached. Stopping.`)
        break
      }

      const result = await migrateHearing(db, devDb, devDoc, bulkWriter)
      if (result === "migrate") {
        migrated += 1
      } else if (result === "skip") {
        skipped += 1
      } else {
        failed += 1
      }
    }

    await bulkWriter.close()
    console.log(
      `Migration complete. Migrated: ${migrated}, Skipped: ${skipped}, Failed: ${failed}`
    )
  }
}
