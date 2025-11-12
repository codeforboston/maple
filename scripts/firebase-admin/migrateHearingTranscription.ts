import * as admin from "firebase-admin"
import { Number, Record, String } from "runtypes"
import { Script } from "./types"

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
        try {
          await db
            .collection("transcriptions")
            .doc(transcriptionId)
            .create(devTranscriptionData)
        } catch (err) {
          console.error(`Error creating transcription ${transcriptionId}:`, err)
          return
        }
      } else {
        console.error(
          `Transcription ${transcriptionId} not found in dev project.`
        )
      }

      await db.collection("events").doc(hearingId).update({
        videoURL: devData.videoURL,
        videoFetchedAt: devData.videoFetchedAt,
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

    let migrated = 0,
      skipped = 0,
      failed = 0

    const bulkWriter = db.bulkWriter()

    for (const devDoc of devHearingsSnapshot.docs) {
      const devData = devDoc.data()
      if (!devData.videoTranscriptionId) {
        skipped++
        continue
      }

      const targetDoc = await db.collection("events").doc(devDoc.id).get()
      const targetData = targetDoc.exists ? targetDoc.data() : null

      if (!targetData) {
        skipped++
        continue
      }

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
          try {
            bulkWriter.create(
              db.collection("transcriptions").doc(transcriptionId),
              devTranscriptionData
            )
          } catch (err) {
            failed++
            console.error(
              `Error creating transcription ${transcriptionId}:`,
              err
            )
            continue
          }
        } else {
          failed++
          console.error(
            `Transcription ${transcriptionId} not found in dev project.`
          )
          continue
        }

        bulkWriter.update(db.collection("events").doc(devDoc.id), {
          videoURL: devData.videoURL,
          videoFetchedAt: devData.videoFetchedAt,
          videoTranscriptionId: devData.videoTranscriptionId
        })
        migrated++
      } else {
        skipped++
      }
    }

    await bulkWriter.close()
    console.log(
      `Migration complete. Migrated: ${migrated}, Skipped: ${skipped}, Failed: ${failed}`
    )
  }
}
