/**
 * Backfill lobbying disclosure data from 2005 to the present.
 *
 * This script is the primary ingestion path for all historical data. The live
 * Cloud Function (scrapeLobbying) only handles the current and prior year in
 * steady state. Run this once to populate the full history, and re-run with
 * --year to refresh specific years.
 *
 * Usage:
 *   GOOGLE_APPLICATION_CREDENTIALS=~/.config/gcloud/application_default_credentials.json \
 *     yarn firebase-admin run-script backfillLobbying --env dev
 *
 * Options:
 *   --year  NUMBER   Only process this year (useful for testing or re-runs)
 *   --limit NUMBER   Max registrants to process per year (for testing)
 *
 * Cursor storage:
 *   Processed disclosure URLs are stored as documents in the Firestore
 *   subcollection /scrapers/lobbyingBackfill/processedUrls/{urlHash}.
 *   This scales to the full historical URL set (~50,000+) without hitting the
 *   1MB Firestore document size limit. Restart the script at any time; it will
 *   resume from where it left off.
 */

import { createHash } from "crypto"
import { z } from "zod"
import {
  allLobbyingYears,
  processDisclosure,
  writeRegistrant
} from "../../functions/src/lobbying/scrapeLobbying"
import {
  fetchDisclosureMeta,
  fetchSummaryLinks,
  makePortalClient
} from "../../functions/src/lobbying/portal"
import {
  BACKFILL_DOC,
  BACKFILL_URLS_COLLECTION,
  FIRST_LOBBYING_YEAR
} from "../../functions/src/lobbying/types"
import { Script } from "./types"

const Args = z
  .object({
    year: z.number().int().min(FIRST_LOBBYING_YEAR).optional(),
    limit: z.number().int().positive().optional()
  })
  .passthrough()

export const script: Script = async ({ db, args }) => {
  const { year: onlyYear, limit } = Args.parse(args)

  const years = onlyYear ? [onlyYear] : allLobbyingYears()
  console.log(
    `backfillLobbying: processing years ${years[0]}–${years[years.length - 1]}`
  )

  // Load already-processed disc URLs from the subcollection cursor.
  const backfillRef = db.doc(BACKFILL_DOC)
  const processedSnap = await backfillRef
    .collection(BACKFILL_URLS_COLLECTION)
    .select() // fetch only doc IDs (the URL hash), no field data needed
    .get()
  const processedHashes = new Set(processedSnap.docs.map(d => d.id))
  console.log(
    `backfillLobbying: ${processedHashes.size} disc URLs already processed`
  )

  const client = makePortalClient()
  let totalNew = 0

  for (const year of years) {
    console.log(`\n── ${year} ──`)

    let summaryUrls: string[]
    try {
      summaryUrls = await fetchSummaryLinks(client, year)
    } catch (e) {
      console.error(`  Failed to fetch summary links for ${year}:`, e)
      continue
    }

    if (limit) summaryUrls = summaryUrls.slice(0, limit)
    console.log(`  ${summaryUrls.length} registrants on portal`)

    let yearNew = 0

    for (let i = 0; i < summaryUrls.length; i++) {
      const summaryUrl = summaryUrls[i]
      let meta: Awaited<ReturnType<typeof fetchDisclosureMeta>>

      try {
        meta = await fetchDisclosureMeta(client, summaryUrl)
      } catch (e) {
        console.warn(
          `  [${i + 1}/${
            summaryUrls.length
          }] Failed to fetch summary: ${summaryUrl}`,
          e
        )
        continue
      }

      if (meta.entityName && meta.year) {
        try {
          await writeRegistrant(
            db,
            meta.entityName,
            meta.year,
            meta.regType,
            meta.disclosureUrls
          )
        } catch (e) {
          console.warn(`  Failed to write registrant ${meta.entityName}:`, e)
        }
      }

      for (const discUrl of meta.disclosureUrls) {
        const urlHash = createHash("sha256")
          .update(discUrl)
          .digest("hex")
          .slice(0, 40)
        if (processedHashes.has(urlHash)) continue

        try {
          await processDisclosure(db, client, summaryUrl, discUrl, year)

          // Mark as processed in the subcollection cursor
          await backfillRef
            .collection(BACKFILL_URLS_COLLECTION)
            .doc(urlHash)
            .set({ url: discUrl, processedAt: new Date().toISOString() })

          processedHashes.add(urlHash)
          totalNew++
          yearNew++
        } catch (e) {
          console.warn(`  Failed to process disclosure ${discUrl}:`, e)
        }
      }

      if ((i + 1) % 50 === 0 || i + 1 === summaryUrls.length) {
        console.log(
          `  [${i + 1}/${
            summaryUrls.length
          }] ${yearNew} new disclosures this year`
        )
      }
    }

    console.log(`  ${year} complete: ${yearNew} new disclosures`)
  }

  console.log(`\nbackfillLobbying complete: ${totalNew} new disclosures total`)
}
