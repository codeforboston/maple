import { logger } from "firebase-functions"
import { runWith } from "firebase-functions/v1"
import { db, Timestamp } from "../firebase"
import type { Database } from "../types"
import { normalizeEntityName } from "./normalize"
import {
  fetchDisclosureDetail,
  fetchDisclosureMeta,
  fetchSummaryLinks,
  filingId,
  makePortalClient,
  registrantId,
  yearToGeneralCourt
} from "./portal"
import {
  FILINGS_COLLECTION,
  FIRST_LOBBYING_YEAR,
  LobbyingFiling,
  LobbyingRegistrant,
  REGISTRANTS_COLLECTION,
  SCRAPER_DOC
} from "./types"

/**
 * Scraper state stored in Firestore at /scrapers/lobbying.
 *
 * processedDiscUrls: disc URLs already fetched; skip on re-runs.
 * summaryDiscCache:  maps summaryUrl → its known disc URLs so we can skip
 *                    summary page GETs for registrants with no new filings.
 */
interface ScraperState {
  processedDiscUrls: string[]
  summaryDiscCache: Record<string, string[]>
}

/**
 * Maximum number of new disclosure pages to fetch per function invocation.
 * Each page takes ~1s; this keeps the run well within the 540s timeout.
 * Remaining work is picked up on the next scheduled run.
 */
const MAX_DISCLOSURES_PER_RUN = 200

/**
 * Scrape lobbying disclosure data for the current and prior calendar year.
 *
 * Runs every 24 hours. New filers arrive semi-annually so daily polling is
 * more than sufficient for steady-state freshness. For initial historical
 * ingestion (2005-present) use the backfillLobbying admin script instead.
 *
 * Progress is checkpointed to Firestore after every disclosure page so the
 * function is fully resumable if it times out or is interrupted.
 */
export const scrapeLobbying = runWith({ timeoutSeconds: 540, maxInstances: 1 })
  .pubsub.schedule("every 24 hours")
  .onRun(async () => {
    const currentYear = new Date().getFullYear()
    const years = [currentYear, currentYear - 1]

    const scraperRef = db.doc(SCRAPER_DOC)
    const scraperDoc = await scraperRef.get()
    const state: ScraperState = {
      processedDiscUrls: scraperDoc.data()?.processedDiscUrls ?? [],
      summaryDiscCache: scraperDoc.data()?.summaryDiscCache ?? {}
    }
    const processedSet = new Set<string>(state.processedDiscUrls)
    const summaryCache: Record<string, string[]> = state.summaryDiscCache

    const client = makePortalClient()
    let newDiscCount = 0

    for (const year of years) {
      if (newDiscCount >= MAX_DISCLOSURES_PER_RUN) break

      logger.info(`scrapeLobbying: fetching summary links for ${year}`)
      let summaryUrls: string[]
      try {
        summaryUrls = await fetchSummaryLinks(client, year)
      } catch (e) {
        logger.error(
          `scrapeLobbying: failed to fetch summary links for ${year}`,
          e
        )
        continue
      }
      logger.info(
        `scrapeLobbying: ${summaryUrls.length} registrants for ${year}`
      )

      for (const summaryUrl of summaryUrls) {
        if (newDiscCount >= MAX_DISCLOSURES_PER_RUN) break

        // Use cached disc URLs when available to avoid re-fetching summary pages.
        // For current year we always re-check (new filings arrive mid-year).
        let discUrls = summaryCache[summaryUrl]
        if (!discUrls || year === currentYear) {
          try {
            const meta = await fetchDisclosureMeta(client, summaryUrl)
            discUrls = meta.disclosureUrls

            // Write registrant doc (upsert); don't wait for individual writes to
            // finish — use a bulkWriter for the doc contents but checkpoint the
            // scraper state separately so interruptions are recoverable.
            if (meta.entityName && meta.year) {
              await writeRegistrant(
                db,
                meta.entityName,
                meta.year,
                meta.regType,
                discUrls
              )
            }

            summaryCache[summaryUrl] = discUrls
            await scraperRef.set(
              { summaryDiscCache: summaryCache },
              { merge: true }
            )
          } catch (e) {
            logger.warn(
              `scrapeLobbying: failed to fetch summary ${summaryUrl}`,
              e
            )
            continue
          }
        }

        const newDiscUrls = discUrls.filter(u => !processedSet.has(u))
        if (newDiscUrls.length === 0) continue

        for (const discUrl of newDiscUrls) {
          if (newDiscCount >= MAX_DISCLOSURES_PER_RUN) break
          try {
            await processDisclosure(db, client, summaryUrl, discUrl, year)
            processedSet.add(discUrl)
            newDiscCount++

            // Checkpoint after every disclosure so restarts lose at most one page
            await scraperRef.set(
              { processedDiscUrls: Array.from(processedSet) },
              { merge: true }
            )
          } catch (e) {
            logger.warn(
              `scrapeLobbying: failed to process disclosure ${discUrl}`,
              e
            )
          }
        }
      }
    }

    logger.info(`scrapeLobbying: processed ${newDiscCount} new disclosures`)
  })

// ─── Shared write helpers (also used by backfillLobbying) ────────────────────

/**
 * Write or update a LobbyingRegistrant document. Client list is assembled from
 * the disclosure meta; filing documents are written separately per-bill.
 */
export async function writeRegistrant(
  database: Database,
  entityName: string,
  year: number,
  regType: "Lobbyist" | "Employer",
  disclosureUrls: string[]
): Promise<void> {
  const id = registrantId(entityName, year)
  const ref = database.collection(REGISTRANTS_COLLECTION).doc(id)
  const partial: Omit<LobbyingRegistrant, "clients" | "fetchedAt"> & {
    fetchedAt: FirebaseFirestore.Timestamp
  } = {
    registrantId: id,
    entityName,
    entityNameNorm: normalizeEntityName(entityName),
    year,
    generalCourt: yearToGeneralCourt(year),
    regType,
    disclosureUrls,
    fetchedAt: Timestamp.now()
  }
  // Merge so repeated runs don't wipe clients accumulated from multiple disclosures
  await ref.set(partial, { merge: true })
}

/**
 * Fetch one CompleteDisclosure page and write LobbyingFiling documents.
 * Also updates the registrant's client list.
 */
export async function processDisclosure(
  database: Database,
  client: ReturnType<typeof makePortalClient>,
  summaryUrl: string,
  discUrl: string,
  year: number
): Promise<void> {
  const meta = await fetchDisclosureMeta(client, summaryUrl)
  const detail = await fetchDisclosureDetail(client, discUrl, year)

  const { entityName, regType } = meta
  const gc = yearToGeneralCourt(year)
  const entityNameNorm = normalizeEntityName(entityName)
  const now = Timestamp.now()

  // Update registrant's client list
  if (entityName && year) {
    const regRef = database
      .collection(REGISTRANTS_COLLECTION)
      .doc(registrantId(entityName, year))

    const clients = detail.compensation.map(c => ({
      clientName: c.clientName,
      clientNameNorm: normalizeEntityName(c.clientName),
      compensation: c.amount
    }))

    await regRef.set(
      {
        registrantId: registrantId(entityName, year),
        entityName,
        entityNameNorm,
        year,
        generalCourt: gc,
        regType: regType ?? "Lobbyist",
        clients,
        disclosureUrls: [discUrl],
        fetchedAt: now
      },
      { merge: true }
    )
  }

  // Write one LobbyingFiling doc per bill row
  if (detail.bills.length === 0) return

  const writer = database.bulkWriter()
  for (const bill of detail.bills) {
    const fid = filingId(
      entityName,
      bill.clientName,
      bill.chamber,
      bill.billId,
      gc,
      bill.position
    )
    const doc: LobbyingFiling = {
      filingId: fid,
      entityName,
      entityNameNorm,
      clientName: bill.clientName,
      clientNameNorm: normalizeEntityName(bill.clientName),
      year,
      generalCourt: gc,
      chamber: bill.chamber,
      billId: bill.billId,
      activityTitle: bill.activityTitle,
      position: bill.position,
      amount: bill.amount,
      fetchedAt: now
    }
    writer.set(database.collection(FILINGS_COLLECTION).doc(fid), doc, {
      merge: false
    })
  }
  await writer.close()
}

/** All years to scrape, for use by the backfill script. */
export function allLobbyingYears(): number[] {
  const current = new Date().getFullYear()
  const years: number[] = []
  for (let y = FIRST_LOBBYING_YEAR; y <= current; y++) years.push(y)
  return years
}
