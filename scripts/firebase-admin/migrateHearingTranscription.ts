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
    const devHearingsSnapshot = await devDb
      .collection("events")
      .doc(hearingId)
      .get()

    if (!devHearingsSnapshot.exists) {
      console.error(`Hearing ${hearingId} not found in dev project.`)
      return
    }
    const devData = devHearingsSnapshot.data()

    if (!devData?.videoTranscriptionId) {
      console.log(`Hearing ${hearingId} has no transcription to migrate.`)
      return
    }
    const targetDoc = await db.collection("events").doc(hearingId).get()
    const targetData = targetDoc.exists ? targetDoc.data() : null

    // Only migrate if hearing in target environment does not have a transcription yet
    if (!targetData?.videoTranscriptionId) {
      const transcriptionId = devData.videoTranscriptionId
      const devTranscriptionDoc = await devDb
        .collection("transcriptions")
        .doc(transcriptionId)
        .get()

      const devTranscriptionData = devTranscriptionDoc.exists
        ? devTranscriptionDoc.data()
        : null

      if (devTranscriptionData) {
        // Create transcription in target project instead of setting, in case it already exists, which will throw an error
        const convertedData = convertTimestamps(devTranscriptionData)
        try {
          console.log(`Creating transcription ${transcriptionId}...`)
          await db
            .collection("transcriptions")
            .doc(transcriptionId)
            .create(convertedData)
        } catch (err) {
          console.error(`Error creating transcription ${transcriptionId}:`, err)
          return
        }

        const subcollections = await devTranscriptionDoc.ref.listCollections()
        for (const subcol of subcollections) {
          const docs = await subcol.get()
          for (const doc of docs.docs) {
            await db
              .collection("transcriptions")
              .doc(transcriptionId)
              .collection(subcol.id)
              .doc(doc.id)
              .set(doc.data())
          }
        }
      } else {
        console.error(
          `Transcription ${transcriptionId} not found in dev project.`
        )
      }

      await db
        .collection("events")
        .doc(hearingId)
        .update({
          videoURL: devData.videoURL,
          videoFetchedAt: convertTimestamps(devData.videoFetchedAt),
          videoTranscriptionId: devData.videoTranscriptionId
        })
      console.log(`Migration complete for hearing ${hearingId}.`)
    }
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
      const devData = devDoc.data()
      if (!devData.videoTranscriptionId) {
        skipped++
        console.log(`${devDoc.id} has no transcription to migrate.`)
        continue
      }

      const targetDoc = await db.collection("events").doc(devDoc.id).get()
      const targetData = targetDoc.exists ? targetDoc.data() : null

      if (!targetData) {
        skipped++
        console.log(`${devDoc.id} not found in target project.`)
        continue
      }

      // Only migrate if hearing in target environment does not have a transcription yet
      if (!targetData?.videoTranscriptionId) {
        console.log(`Migrating ${devDoc.id}...`)
        const transcriptionId = devData.videoTranscriptionId
        const devTranscriptionDoc = await devDb
          .collection("transcriptions")
          .doc(transcriptionId)
          .get()

        const devTranscriptionData = devTranscriptionDoc.exists
          ? devTranscriptionDoc.data()
          : null

        if (devTranscriptionData) {
          // Create transcription in target project instead of setting, in case it already exists, which will throw an error
          const convertedData = convertTimestamps(devTranscriptionData)
          try {
            console.log(`Creating transcription ${transcriptionId}...`)
            bulkWriter.create(
              db.collection("transcriptions").doc(transcriptionId),
              convertedData
            )
          } catch (err) {
            failed++
            console.error(
              `Error creating transcription ${transcriptionId}:`,
              err
            )
            continue
          }

          const subcollections = await devTranscriptionDoc.ref.listCollections()
          for (const subcol of subcollections) {
            const docs = await subcol.get()
            for (const doc of docs.docs) {
              await db
                .collection("transcriptions")
                .doc(transcriptionId)
                .collection(subcol.id)
                .doc(doc.id)
                .set(doc.data())
            }
          }
        } else {
          failed++
          console.error(
            `Transcription ${transcriptionId} not found in dev project.`
          )
          continue
        }

        console.log(`Updating ${devDoc.id}...`)
        bulkWriter.update(db.collection("events").doc(devDoc.id), {
          videoURL: devData.videoURL,
          videoFetchedAt: convertTimestamps(devData.videoFetchedAt),
          videoTranscriptionId: devData.videoTranscriptionId
        })
        migrated++
      } else {
        console.log(`${devDoc.id} already has a transcription, skipping.`)
        skipped++
      }
    }

    await bulkWriter.close()
    console.log(
      `Migration complete. Migrated: ${migrated}, Skipped: ${skipped}, Failed: ${failed}`
    )
  }
}
